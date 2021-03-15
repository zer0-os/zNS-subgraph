import { BigInt } from "@graphprotocol/graph-ts"
import {
  Registrar,
  Approval,
  ApprovalForAll,
  ControllerAdded,
  ControllerRemoved,
  DomainCreated,
  OwnershipTransferred,
  Paused,
  Transfer,
  Unpaused
} from "../generated/Registrar/Registrar"
import { Account, Domain, TransferEntity} from "../generated/schema"

// event DomainCreated(
//   uint256 indexed id,
//   string name,
//   uint256 indexed nameHash,
//   uint256 indexed parent,
//   address creator,
//   address controller
// );
export function handleDomainCreated(event: DomainCreated): void {
  let account = new Account(event.params.creator.toHexString())
  account.save()
  let domain = Domain.load(event.params.id.toHex());
  let domainParent = Domain.load(event.params.parent.toHex());
    domain.creator = account.id
    domain.name = event.params.name
    domain.labelHash = event.params.nameHash.toHexString()
    domain.parent = domainParent.name
    domain.transactionId = event.transaction.hash
    domain.save()

}

// event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
export function handleTransfer(event: Transfer): void {
  let account = new Account(event.params.to.toHexString())
  account.save()

  let domain = new Domain(event.params.tokenId.toHex());
  domain.owner = account.id
  domain.save()

  let transferEvent = new TransferEntity(event.transaction.hash.toHex())
  transferEvent.domain = event.params.tokenId.toHex()
  transferEvent.blockNumber = event.block.number.toI32()
  transferEvent.transactionId = event.transaction.hash
  transferEvent.owner = account.id
  transferEvent.save()

}
