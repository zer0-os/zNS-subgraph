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
import { Domain } from "../generated/schema"

//  event DomainCreated(
//    uint256 indexed id,
//    string name,
//    uint256 indexed nameHash,
//    uint256 indexed parent
//  );
//need a feild for owner address
export function handleDomainCreated(event: DomainCreated): void {
  let account = new Account(event.params.owner.toHex())
  account.save()

  //store domain by the hash of its unique token ID
  let domain = Domain.load(event.params.id.toHex())
  let domainParent = Domain.load(event.params.parent.toHex())

  if (domain == null) {
    domain = new Domain(event.params.id.toHex())
  }
    domain.owner = event.params.owner
    domain.creator = event.params.ownerOf
    domain.name = event.params.name
    domain.labelHash = event.params.nameHash
    domain.parent = domainParent.name
    domain.save()
}

// event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
export function handleTransfer(event: Transfer): void {
  let account = new Account(event.params.owner.toHex())
  account.save()
  //store domain by the hash of its unique token ID
  let domain = Domain.load(event.params.tokenId.toHex());
  domain.owner = event.params.to
  domain.save()

  let transferEvent = new Transfer(createEventID(event))
  transferEvent.id = transferEvent
  transferEvent.domain = domain
  transferEvent.blockNumber = event.block.number.toI32()
  transferEvent.transactionID = event.transaction.hash
  transferEvent.owner = account.id
  transferEvent.save()
}
