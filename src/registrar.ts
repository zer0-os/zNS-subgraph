import { BigInt, ipfs, json, JSONValue, log, Value } from "@graphprotocol/graph-ts";
import {
  DomainCreated,
  Transfer,
  MetadataChanged,
  RoyaltiesAmountChanged,
  MetadataLockChanged,
  Registrar,
  MetadataUnlocked,
  MetadataLocked,
  DomainCreated1,
} from "../generated/Registrar/Registrar";
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
import { getDefaultRegistrarForNetwork } from "./defaultRegistrar";

import { toPaddedHexString, containsAny, handleMetadata } from "./utils";

export function handleDomainCreated(event: DomainCreated1): void {
  let account = new Account(event.params.minter.toHex());
  account.save();

  let registrarContract = new RegistrarContract(getDefaultRegistrarForNetwork().toHexString());
  registrarContract.rootDomain = "0x0";
  registrarContract.save();

  let domainId = toPaddedHexString(event.params.id);
  let domain = Domain.load(domainId)!;

  let parentId = toPaddedHexString(event.params.parent);
  let domainParent = Domain.load(parentId);
  if (domainParent == null) {
    log.log(log.Level.WARNING, "no parent of: " + parentId);
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

  if (domainParent.name === null) {
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

  let registrar = Registrar.bind(event.address);
  domain.isLocked = registrar.isDomainMetadataLocked(event.params.id);
  domain.lockedBy = registrar.domainMetadataLockedBy(event.params.id).toHexString();
  domain.contract = getDefaultRegistrarForNetwork().toHexString();
  domain.save();

  let mintedEvent = new DomainMinted(domainId);
  mintedEvent.domain = domainId;
  mintedEvent.blockNumber = event.block.number.toI32();
  mintedEvent.transactionID = event.transaction.hash;
  mintedEvent.timestamp = event.block.timestamp;
  mintedEvent.minter = event.params.minter.toHex();
  mintedEvent.save();
}

// event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
export function handleTransfer(event: Transfer): void {
  let account = new Account(event.params.to.toHex());
  account.save();
  let fromAccount = new Account(event.params.from.toHex());
  fromAccount.save();

  let registrarContract = new RegistrarContract(getDefaultRegistrarForNetwork().toHexString());
  registrarContract.rootDomain = "0x0";
  registrarContract.save();

  let domainId = toPaddedHexString(event.params.tokenId);
  let domain = Domain.load(domainId);
  if (domain === null) {
    domain = new Domain(domainId);
    domain.isLocked = false;
    domain.royaltyAmount = BigInt.fromI32(0);
  }
  domain.owner = account.id;
  if (domain.contract === null) {
    domain.contract = getDefaultRegistrarForNetwork().toHexString();
  }
  domain.save();

  // ignore transfers to self
  if (event.params.to == event.params.from) {
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

export function handleMetadataChanged(event: MetadataChanged): void {
  let domainId = toPaddedHexString(event.params.id);
  let domain = Domain.load(domainId);
  if (domain === null) {
    domain = new Domain(domainId);
  }
  domain.metadata = event.params.uri;
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

export function handleMetadataLockChanged(event: MetadataLockChanged): void {
  let account = new Account(event.params.locker.toHex());
  account.save();

  let domainId = toPaddedHexString(event.params.id);
  let domain = Domain.load(domainId);
  if (domain === null) {
    domain = new Domain(domainId);
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

export function handleRoyaltiesAmountChanged(event: RoyaltiesAmountChanged): void {
  let domainId = toPaddedHexString(event.params.id);
  let domain = Domain.load(domainId);
  if (domain === null) {
    domain = new Domain(domainId);
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

export function handleMetadataLocked(event: MetadataLocked): void {
  let account = new Account(event.params.locker.toHex());
  account.save();

  let domainId = toPaddedHexString(event.params.id);
  let domain = Domain.load(domainId);
  if (domain === null) {
    domain = new Domain(domainId);
  }
  domain.isLocked = true;
  domain.lockedBy = account.id;
  domain.save();

  let dml = new DomainMetadataLocked(
    event.block.number.toString().concat("-").concat(event.logIndex.toString()),
  );
  dml.domain = domainId;
  dml.blockNumber = event.block.number.toI32();
  dml.transactionID = event.transaction.hash;
  dml.timestamp = event.block.timestamp;
  dml.isLocked = true;
  dml.save();
}

export function handleMetadataUnlocked(event: MetadataUnlocked): void {
  let domainId = toPaddedHexString(event.params.id);
  let domain = Domain.load(domainId);
  if (domain === null) {
    domain = new Domain(domainId);
  }
  domain.isLocked = false;
  domain.lockedBy = null;
  domain.save();

  let dml = new DomainMetadataLocked(
    event.block.number.toString().concat("-").concat(event.logIndex.toString()),
  );
  dml.domain = domainId;
  dml.blockNumber = event.block.number.toI32();
  dml.transactionID = event.transaction.hash;
  dml.timestamp = event.block.timestamp;
  dml.isLocked = false;
  dml.save();
}

export function handleDomainCreatedLegacy(event: DomainCreated): void {
  let account = new Account(event.params.minter.toHex());
  account.save();

  let domainId = toPaddedHexString(event.params.id);
  let domain = Domain.load(domainId)!;

  let parentId = toPaddedHexString(event.params.parent);
  let domainParent = Domain.load(parentId)!;
  domain.owner = account.id;
  domain.minter = account.id;

  let hasBadCharacters = containsAny(event.params.name, "\n,./<>?;':\"[]{}=+`~!@#$%^&*()|\\ ");
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

  if (domainParent.name === null) {
    domain.name = event.params.name;
  } else {
    domain.name = domainParent.name + "." + event.params.name;
  }
  domain.label = event.params.name;
  domain.labelHash = event.params.nameHash.toHex();
  domain.parent = parentId;
  domain.creationTimestamp = event.block.timestamp;

  domain.save();

  let mintedEvent = new DomainMinted(domainId);
  mintedEvent.domain = domainId;
  mintedEvent.blockNumber = event.block.number.toI32();
  mintedEvent.transactionID = event.transaction.hash;
  mintedEvent.timestamp = event.block.timestamp;
  mintedEvent.minter = event.params.minter.toHex();
  mintedEvent.save();
}
