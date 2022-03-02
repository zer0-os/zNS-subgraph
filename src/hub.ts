import { BigInt } from "@graphprotocol/graph-ts";
import {
  Account,
  Domain,
  DomainTransferred,
  DomainMetadataChanged,
  DomainMetadataLocked,
  DomainRoyaltyChanged,
  DomainMinted,
  Global,
} from "../generated/schema";
import {
  EEDomainCreatedV2,
  EEMetadataChanged,
  EEMetadataLockChanged,
  EENewSubdomainRegistrar,
  EERoyaltiesAmountChanged,
  EETransferV1,
} from "../generated/ZNSHub/ZNSHub";

export function handleDomainCreatedV2(event: EEDomainCreatedV2): void {}

export function handleMetadataChanged(event: EEMetadataChanged): void {}

export function handleMetadataLockChanged(event: EEMetadataLockChanged): void {}

export function handleNewSubdomainRegistrar(event: EENewSubdomainRegistrar): void {}

export function handleRoyaltiesAmountChanged(event: EERoyaltiesAmountChanged): void {}

export function handleTransferV1(event: EETransferV1): void {}
