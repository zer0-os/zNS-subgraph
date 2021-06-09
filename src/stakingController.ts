import { Account, Domain, DomainRequest } from "../generated/schema";
import {
  DomainRequestApproved,
  DomainRequestFulfilled,
  DomainRequestPlaced,
} from "../generated/StakingController/StakingController";
import { containsAny, uint256ToByteArray } from "./utils";

export function handleDomainRequestPlaced(event: DomainRequestPlaced): void {
  let account = new Account(event.params.requestor.toHex());
  account.save();

  let parentId = uint256ToByteArray(event.params.parentId);
  let domainParent = Domain.load(parentId.toHex());

  let domainLabel = event.params.name;

  let hasBadCharacters = containsAny(domainLabel, "\n,./<>?;':\"[]{}=+`~!@#$%^&*()|\\ ");
  if (hasBadCharacters) {
    return;
  }

  let request = new DomainRequest(event.params.requestId.toHex());
  request.parent = parentId.toHex();
  request.requestUri = event.params.requestUri;
  request.requestor = account.id;
  request.nonce = event.params.domainNonce;
  request.offeredAmount = event.params.offeredAmount;
  request.label = event.params.name.toString();

  if (domainParent.name == null) {
    request.domain = domainLabel;
  } else {
    request.domain = domainParent.name + "." + domainLabel;
  }

  request.timestamp = event.block.timestamp;
  request.fulfilled = false;
  request.approved = false;

  request.save();
}

export function handleDomainRequestApproved(event: DomainRequestApproved): void {
  let request = DomainRequest.load(event.params.requestId.toHex());
  if (!request) {
    return;
  }

  request.approved = true;
  request.save();
}

export function handleDomainRequestFulfilled(event: DomainRequestFulfilled): void {
  let request = DomainRequest.load(event.params.requestId.toHex());
  if (!request) {
    return;
  }

  request.fulfilled = true;
  request.save();

  let domainId = uint256ToByteArray(event.params.domainId);
  let domain = Domain.load(domainId.toHex());
  domain.nonce = event.params.domainNonce;
  domain.save();
}
