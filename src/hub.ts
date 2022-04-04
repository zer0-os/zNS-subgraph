import { BigInt, ipfs, json, log } from "@graphprotocol/graph-ts";
import { Registrar } from "../generated/Registrar/Registrar";
import {
  Account,
  Domain,
  DomainTransferred,
  DomainMetadataChanged,
  DomainMetadataLocked,
  DomainRoyaltyChanged,
  DomainMinted,
  Global,
  RegistrarContract,
} from "../generated/schema";
import {
  EEDomainCreatedV2,
  EEMetadataChanged,
  EEMetadataLockChanged,
  EENewSubdomainRegistrar,
  EERoyaltiesAmountChanged,
  EETransferV1,
} from "../generated/ZNSHub/ZNSHub";
import { getDefaultRegistrarForNetwork } from "./defaultRegistrar";
import { containsAny, handleMetadata, toPaddedHexString } from "./utils";
import { RegExp } from "./lib/assemblyscript-regex/assembly";

export function handleDomainCreatedV2(event: EEDomainCreatedV2): void {
  let account = new Account(event.params.minter.toHex());
  account.save();

  let registrarContract = new RegistrarContract(event.params.registrar.toHexString());
  registrarContract.save();

  let domainId = toPaddedHexString(event.params.id);
  let domain = Domain.load(domainId);
  if (!domain) {
    domain = new Domain(domainId);
  }

  let parentId = toPaddedHexString(event.params.parent);
  let domainParent = Domain.load(parentId);
  if (!domainParent) {
    domainParent = new Domain(parentId);
  }
  domain.owner = account.id;
  domain.minter = account.id;

  let hasBadCharacters = containsAny(event.params.label, "\n,./<>?;':\"[]{}=+`~!@#$%^&*()|\\ ");
  if (hasBadCharacters) {
    return;
  }

  if (!domain.indexId) {
    let global = Global.load("1");
    if (global === null) {
      global = new Global("1");
      global.domainCount = 0;
    }
    global.domainCount += 1;
    global.save();

    domain.indexId = global.domainCount;
  }

  if (domainParent.name == null) {
    domain.name = event.params.label;
  } else {
    domain.name = domainParent.name + "." + event.params.label;
  }
  domain.label = event.params.label;
  domain.labelHash = event.params.labelHash.toHex();
  domain.parent = parentId;
  domain.metadata = event.params.metadataUri;
  domain.creationTimestamp = event.block.timestamp;
  domain.royaltyAmount = event.params.royaltyAmount;

  let registrar = Registrar.bind(event.params.registrar);
  domain.isLocked = registrar.isDomainMetadataLocked(event.params.id);
  domain.lockedBy = registrar.domainMetadataLockedBy(event.params.id).toString();
  domain.contract = event.params.registrar.toHexString();

  let reg = new RegExp(".+(Qm.+)");
  let match = reg.exec(event.params.metadataUri);
  if (match) {
    let qmLocation = match.matches[1];
    let contents = ipfs.cat(qmLocation);
    if (contents) {
      let metadataContents = contents.toString();
      domain.metadataContents = metadataContents;
      domain.save();

      let metadataAsJson = json.try_fromBytes(contents);
      if (metadataAsJson.isOk) {
        handleMetadata(domain, metadataAsJson.value);
      }
    } else {
      log.log(log.Level.WARNING, "unable to fetch ipfs file: " + qmLocation);
    }
  }

  domain.save();

  let mintedEvent = new DomainMinted(domainId);
  mintedEvent.domain = domainId;
  mintedEvent.blockNumber = event.block.number.toI32();
  mintedEvent.transactionID = event.transaction.hash;
  mintedEvent.timestamp = event.block.timestamp;
  mintedEvent.minter = event.params.minter.toHex();
  mintedEvent.save();
}

export function handleMetadataChanged(event: EEMetadataChanged): void {
  let domainId = toPaddedHexString(event.params.id);
  let domain = Domain.load(domainId);
  if (domain == null) {
    domain = new Domain(domainId);
    domain.isLocked = false;
    domain.royaltyAmount = BigInt.fromI32(0);
  }
  domain.metadata = event.params.uri;

  let reg = new RegExp(".+(Qm.+)");
  let match = reg.exec(event.params.uri);
  if (match) {
    let qmLocation = match.matches[1];
    let contents = ipfs.cat(qmLocation);
    if (contents) {
      let metadataContents = contents.toString();
      domain.metadataContents = metadataContents;
      domain.save();

      let metadataAsJson = json.try_fromBytes(contents);
      if (metadataAsJson.isOk) {
        handleMetadata(domain, metadataAsJson.value);
      }
    } else {
      log.log(log.Level.WARNING, "unable to fetch ipfs file: " + qmLocation);
    }
  }

  domain.save();

  let dmc = new DomainMetadataChanged(
    event.block.number.toString().concat("-").concat(event.logIndex.toString()),
  );
  dmc.domain = domainId;
  dmc.blockNumber = event.block.number.toI32();
  dmc.transactionID = event.transaction.hash;
  dmc.timestamp = event.block.timestamp;
  dmc.metadataUri = event.params.uri;

  dmc.save();
}

export function handleMetadataLockChanged(event: EEMetadataLockChanged): void {
  let account = new Account(event.params.locker.toHex());
  account.save();

  let domainId = toPaddedHexString(event.params.id);
  let domain = Domain.load(domainId);
  if (domain == null) {
    domain = new Domain(domainId);
    domain.isLocked = false;
    domain.royaltyAmount = BigInt.fromI32(0);
  }
  domain.isLocked = event.params.isLocked;
  domain.lockedBy = account.id;
  domain.save();

  let dml = new DomainMetadataLocked(
    event.block.number.toString().concat("-").concat(event.logIndex.toString()),
  );
  dml.domain = domainId;
  dml.blockNumber = event.block.number.toI32();
  dml.transactionID = event.transaction.hash;
  dml.timestamp = event.block.timestamp;
  dml.isLocked = event.params.isLocked;
  dml.save();
}

export function handleNewSubdomainRegistrar(event: EENewSubdomainRegistrar): void {
  let registrarContract = new RegistrarContract(event.params.childRegistrar.toHexString());
  registrarContract.rootDomain = toPaddedHexString(event.params.rootId);
  registrarContract.save();
}

export function handleRoyaltiesAmountChanged(event: EERoyaltiesAmountChanged): void {
  let domainId = toPaddedHexString(event.params.id);
  let domain = Domain.load(domainId);
  if (domain == null) {
    domain = new Domain(domainId);
    domain.isLocked = false;
  }
  domain.royaltyAmount = event.params.amount;
  domain.save();

  let drc = new DomainRoyaltyChanged(
    event.block.number.toString().concat("-").concat(event.logIndex.toString()),
  );
  drc.domain = domainId;
  drc.blockNumber = event.block.number.toI32();
  drc.transactionID = event.transaction.hash;
  drc.timestamp = event.block.timestamp;
  drc.royaltyAmount = event.params.amount;
  drc.save();
}

export function handleTransferV1(event: EETransferV1): void {
  let account = new Account(event.params.to.toHex());
  account.save();
  let fromAccount = new Account(event.params.from.toHex());
  fromAccount.save();

  let registrarContract = new RegistrarContract(getDefaultRegistrarForNetwork().toHexString());
  registrarContract.rootDomain = "0x0";
  registrarContract.save();

  let domainId = toPaddedHexString(event.params.tokenId);
  let domain = Domain.load(domainId);
  if (domain == null) {
    domain = new Domain(domainId);
    domain.isLocked = false;
    domain.royaltyAmount = BigInt.fromI32(0);
  }
  domain.owner = account.id;
  domain.contract = event.params.registrar.toHexString();
  domain.save();

  if (domain.contract == getDefaultRegistrarForNetwork().toHexString()) {
    // Transfer event was handled by the original registrar event handlers
    return;
  }

  let transferEvent = new DomainTransferred(
    event.block.number.toString().concat("-").concat(event.logIndex.toString()),
  );
  transferEvent.domain = domainId;
  transferEvent.blockNumber = event.block.number.toI32();
  transferEvent.transactionID = event.transaction.hash;
  transferEvent.timestamp = event.block.timestamp;
  transferEvent.from = event.params.from.toHex() !== null ? event.params.from.toHex() : "0x0";
  transferEvent.to = event.params.to.toHex();
  transferEvent.save();
}
