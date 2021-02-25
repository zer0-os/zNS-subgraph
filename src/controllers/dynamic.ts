import { log, crypto } from "@graphprotocol/graph-ts";
import {
    DynamicTokenCreated,
    DynamicConverterUpgraded
} from "../../generated/DynamicTokenController/DynamicTokenController";
import { DynamicTokenAddresses } from "../../generated/schema";
import { ROOT_ID_BIGINT, concat, getDomainHash } from "../utils";


export function handleDynamicTokenCreated(event: DynamicTokenCreated): void {

}

export function handleDynamicConverterUpgraded(event: DynamicConverterUpgraded): void {

}
