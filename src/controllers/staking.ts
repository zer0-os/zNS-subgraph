import { log, crypto } from "@graphprotocol/graph-ts";
import {
  StakeTokenSet,
  MinBidSet,
  BidAccepted,
  BidClaimed,
  Bid,
} from "../../generated/StakingController/StakingController";
import { Stake, StakingDomainConfig, Domain } from "../../generated/schema";
import { ROOT_ID_BIGINT, concat, getDomainHash } from "../utils";

export function handleStakeTokenSet(event: StakeTokenSet): void {
  let config = new StakingDomainConfig(event.params.id.toString());
  config.stakeToken = event.params.stakeToken;
  config.save();
}
export function handleMinBidSet(event: MinBidSet): void {
  let config = StakingDomainConfig.load(event.params.id.toString());
  config.minBid = event.params.minBid;
  config.save();
}

export function handleBidAccepted(event: BidAccepted): void {
  let stake = Stake.load(event.params.id.toString());
  stake.status = "ACCEPTED";
  stake.save();
}

export function handleBidClaimed(event: BidClaimed): void {
  let stake = Stake.load(event.params.id.toString());
  stake.status = "STAKED";
  stake.save();
}

export function handleBid(event: Bid): void {
  let stakeHash = crypto.keccak256(
    concat(
      event.params.staker,
      getDomainHash(event.params.parentId, event.params.name)
    )
  );
  let parentId = event.params.parentId;
  // might need conversion to BigInt then to string
  let stake = Stake.load(stakeHash.toString());
  stake.status = "BID";
  stake.parentId = event.params.parentId;
  stake.name = event.params.name;
  stake.amount = event.params.amt;
  stake.controller = event.params.controller;
  stake.controllerData = event.params.createData.controllerData;
  stake.lockableProperties = event.params.createData.lockableProperties;
  stake.stakeToken = StakingDomainConfig.load(
    event.params.parentId.toString()
  ).stakeToken;
  if (parentId.equals(ROOT_ID_BIGINT)) {
    stake.domain = event.params.name;
  } else {
    let parent = Domain.load(parentId.toString());
    log.info("parent name", [parent.name]);
    stake.domain = parent.domain + "." + event.params.name;
  }
  stake.save();
}
