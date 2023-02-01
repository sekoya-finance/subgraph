import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import { CreateDCA } from "../generated/Factory/Factory"

export function createCreateDCAEvent(newVault: Address): CreateDCA {
  let createDcaEvent = changetype<CreateDCA>(newMockEvent())

  createDcaEvent.parameters = new Array()

  createDcaEvent.parameters.push(
    new ethereum.EventParam("newVault", ethereum.Value.fromAddress(newVault))
  )

  return createDcaEvent
}
