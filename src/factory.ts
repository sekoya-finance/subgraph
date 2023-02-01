import { CreateDCA as CreateDCAEvent } from "../generated/Factory/Factory"
import { CreateDCA } from "../generated/schema"

export function handleCreateDCA(event: CreateDCAEvent): void {
  let entity = new CreateDCA(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newVault = event.params.newVault

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
