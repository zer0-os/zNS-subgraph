import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { Registrar } from "../generated/Registrar/Registrar";
import {
  Account,
  Domain,
  DomainTransferred,
  DomainMetadataChanged,
  DomainMetadataLocked,
  DomainRoyaltyChanged,
  DomainMinted,
  RegistrarContract,
  DomainGroup,
} from "../generated/schema";
import {
  EEDomainCreatedV2,
  EEDomainCreatedV3,
  EEDomainGroupUpdatedV1,
  EEMetadataChanged,
  EEMetadataLockChanged,
  EENewSubdomainRegistrar,
  EERefreshMetadata,
  EERoyaltiesAmountChanged,
  EETransferV1,
} from "../generated/ZNSHub/ZNSHub";
import { getDefaultRegistrarForNetwork } from "./defaultRegistrar";
import {
  containsAny,
  domainGroupId as generateDomainGroupId,
  getGlobalTracker,
  setupGlobalTracker,
  toPaddedHexString,
} from "./utils";

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
    setupGlobalTracker(domain);
  }

  if (domainParent.name == null) {
    domain.name = event.params.label;
  } else {
    domain.name = domainParent.name.concat(".").concat(event.params.label);
  }
  domain.label = event.params.label;
  domain.labelHash = event.params.labelHash.toHex();
  domain.parent = parentId;
  domain.metadata = event.params.metadataUri;
  domain.creationTimestamp = event.block.timestamp;
  domain.royaltyAmount = event.params.royaltyAmount;

  let registrar = Registrar.bind(event.params.registrar);
  domain.isLocked = registrar.isDomainMetadataLocked(event.params.id);
  domain.lockedBy = registrar.domainMetadataLockedBy(event.params.id).toHex();
  domain.contract = event.params.registrar.toHex();
  domain.save();

  // fetchAndSaveDomainMetadata(domain);

  let mintedEvent = new DomainMinted(domainId);
  mintedEvent.domain = domainId;
  mintedEvent.blockNumber = event.block.number.toI32();
  mintedEvent.transactionID = event.transaction.hash;
  mintedEvent.timestamp = event.block.timestamp;
  mintedEvent.minter = event.params.minter.toHex();
  mintedEvent.save();
}

export function handleDomainCreatedV3(event: EEDomainCreatedV3): void {
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
    setupGlobalTracker(domain);
  }

  if (domainParent.name == null) {
    domain.name = event.params.label;
  } else {
    domain.name = domainParent.name.concat(".").concat(event.params.label);
  }
  domain.label = event.params.label;
  domain.labelHash = event.params.labelHash.toHex();
  domain.parent = parentId;
  domain.creationTimestamp = event.block.timestamp;
  domain.royaltyAmount = event.params.royaltyAmount;

  // domain groups
  const domainGroupId = generateDomainGroupId(event.params.registrar, event.params.groupId);
  domain.domainGroup = domainGroupId;
  domain.domainGroupIndex = event.params.groupFileIndex;

  if (domainGroupId == generateDomainGroupId(event.params.registrar, BigInt.fromI32(0))) {
    // not in a domain group
    domain.metadata = event.params.metadataUri;
  } else {
    // in a domain group
    const domainGroup = DomainGroup.load(domainGroupId);
    if (!domainGroup) {
      log.error("Expected domain group entity not found for {}", [domainGroupId]);
    } else {
      // Default to nothing in case it wasn't found, yes this won't be anything
      // but it prevents an indexer error
      const metadataUriBase = domainGroup.baseUri;
      domain.metadata = metadataUriBase.concat(event.params.groupFileIndex.toString());

      domain.save();

      let domainsInGroup = domainGroup.domains;
      domainsInGroup.push(domain.id);
      domainGroup.domains = domainsInGroup;
      domainGroup.save();
    }
  }

  let registrar = Registrar.bind(event.params.registrar);
  domain.isLocked = registrar.isDomainMetadataLocked(event.params.id);
  domain.lockedBy = registrar.domainMetadataLockedBy(event.params.id).toHex();
  domain.contract = event.params.registrar.toHexString();
  domain.save();

  // fetchAndSaveDomainMetadata(domain);

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
  domain.save();

  // fetchAndSaveDomainMetadata(domain);

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

export function handleDomainGroupUpdatedV1(event: EEDomainGroupUpdatedV1): void {
  const id = generateDomainGroupId(event.params.parentRegistrar, event.params.folderGroupId);

  let group = DomainGroup.load(id);
  const newGroup = !group;
  if (!group) {
    group = new DomainGroup(id);
    group.groupId = event.params.folderGroupId;
    group.registrar = event.params.parentRegistrar.toHex();
    group.domains = [];
  }

  group.baseUri = event.params.baseUri;

  if (!newGroup && group) {
    const domainsInGroup = group.domains;
    if (!domainsInGroup) {
      log.error("No domains in group {}", [group.id]);
      return;
    }

    for (let i = 0; i < domainsInGroup.length; ++i) {
      let domain = Domain.load(domainsInGroup[i]);
      if (!domain) {
        continue;
      }
      let domainGroupIndex = domain.domainGroupIndex;

      if (!domainGroupIndex) {
        log.warning("No domain group index set for {} but it is in domain group {}", [
          domain.id,
          domain.domainGroup! /* eslint-disable-line @typescript-eslint/no-non-null-assertion */,
        ]);
        continue;
      }

      domain.metadata = event.params.baseUri.concat(domainGroupIndex.toString());
      domain.save();

      // fetchAndSaveDomainMetadata(domain);
    }
  }

  group.save();
}

/* eslint-disable */
export function refreshMetadataV0(event: EERefreshMetadata): void {
  let global = getGlobalTracker();
  let allDomains = global.domainsViaIndex;
  for (let i = 0; i < allDomains.length; ++i) {
    let domain = Domain.load(allDomains[i])!;
    let registrar = Registrar.bind(Address.fromString(domain.contract!));
    let currentTokenUri = registrar.tokenURI(BigInt.fromString(domain.id));
    domain.metadata = currentTokenUri;
    log.log(log.Level.INFO, "refreshed ".concat(domain.id));
    domain.save();
  }
}
/* eslint-enable */
