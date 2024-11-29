import {
  Initialized as InitializedEvent,
  LateQuorumVoteExtensionSet as LateQuorumVoteExtensionSetEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  ProposalCanceled as ProposalCanceledEvent,
  ProposalCreated as ProposalCreatedEvent,
  ProposalExecuted as ProposalExecutedEvent,
  ProposalExtended as ProposalExtendedEvent,
  ProposalQueued as ProposalQueuedEvent,
  ProposalThresholdSet as ProposalThresholdSetEvent,
  QuorumNumeratorUpdated as QuorumNumeratorUpdatedEvent,
  TimelockChange as TimelockChangeEvent,
  VoteCast as VoteCastEvent,
  VoteCastWithParams as VoteCastWithParamsEvent,
  VotingDelaySet as VotingDelaySetEvent,
  VotingPeriodSet as VotingPeriodSetEvent
} from "../generated/L2ArbitrumGovernor/L2ArbitrumGovernor"
import { Bytes } from "@graphprotocol/graph-ts";
import {
  Initialized,
  LateQuorumVoteExtensionSet,
  OwnershipTransferred,
  ProposalCanceled,
  ProposalCreated,
  ProposalExecuted,
  ProposalExtended,
  ProposalQueued,
  ProposalThresholdSet,
  QuorumNumeratorUpdated,
  TimelockChange,
  VoteCast,
  VoteCastWithParams,
  VotingDelaySet,
  VotingPeriodSet,
  ProposalVoteSummary
} from "../generated/schema"
import {
  BigInt,
  BigDecimal,
  store
} from "@graphprotocol/graph-ts"
// Utility constants
const ZERO_BI = BigInt.fromI32(0)
const ZERO_BD = BigDecimal.fromString("0")
const ONE_BI = BigInt.fromI32(1)

// Utility function to update/create ProposalVoteSummary
function updateProposalVoteSummary(
  proposalId: BigInt, 
  support: i32, 
  weight: BigInt,
  timestamp: BigInt
): void {
  let summaryId = proposalId.toString()
  let summary = ProposalVoteSummary.load(summaryId)
  
  // Create if not exists
  if (!summary) {
    summary = new ProposalVoteSummary(summaryId)
    summary.proposalId = proposalId
    summary.totalVotes = ZERO_BI
    summary.totalWeight = ZERO_BI
    summary.votesFor = ZERO_BI
    summary.votesAgainst = ZERO_BI
    summary.votesAbstain = ZERO_BI
    summary.weightFor = ZERO_BI
    summary.weightAgainst = ZERO_BI
    summary.weightAbstain = ZERO_BI
    
    // // Optional: Link to original proposal
    // let proposal = ProposalCreated.load(summaryId)
    // if (proposal) {
    //   summary.proposal = proposal.id
    // }
  }
  
  // Update counters based on support type
  summary.totalVotes = summary.totalVotes.plus(ONE_BI)
  summary.totalWeight = summary.totalWeight.plus(weight)
  
  if (support === 0) {  // Against
    summary.votesAgainst = summary.votesAgainst.plus(ONE_BI)
    summary.weightAgainst = summary.weightAgainst.plus(weight)
  } else if (support === 1) {  // For
    summary.votesFor = summary.votesFor.plus(ONE_BI)
    summary.weightFor = summary.weightFor.plus(weight)
  } else if (support === 2) {  // Abstain
    summary.votesAbstain = summary.votesAbstain.plus(ONE_BI)
    summary.weightAbstain = summary.weightAbstain.plus(weight)
  }
  
  // Calculate percentages (optional)
  summary.percentFor = summary.totalVotes.gt(ZERO_BI)
    ? summary.votesFor.toBigDecimal().div(summary.totalVotes.toBigDecimal()).times(BigDecimal.fromString("100"))
    : ZERO_BD
  
  summary.percentAgainst = summary.totalVotes.gt(ZERO_BI)
    ? summary.votesAgainst.toBigDecimal().div(summary.totalVotes.toBigDecimal()).times(BigDecimal.fromString("100"))
    : ZERO_BD
  
  summary.percentAbstain = summary.totalVotes.gt(ZERO_BI)
    ? summary.votesAbstain.toBigDecimal().div(summary.totalVotes.toBigDecimal()).times(BigDecimal.fromString("100"))
    : ZERO_BD
  
  summary.lastUpdated = timestamp
  summary.save()
}
export function handleInitialized(event: InitializedEvent): void {
  let entity = new Initialized(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.version = event.params.version

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleLateQuorumVoteExtensionSet(
  event: LateQuorumVoteExtensionSetEvent
): void {
  let entity = new LateQuorumVoteExtensionSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldVoteExtension = event.params.oldVoteExtension
  entity.newVoteExtension = event.params.newVoteExtension

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProposalCanceled(event: ProposalCanceledEvent): void {
  let entity = new ProposalCanceled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.proposalId = event.params.proposalId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProposalCreated(event: ProposalCreatedEvent): void {
  let entity = new ProposalCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.proposalId = event.params.proposalId
  entity.proposer = event.params.proposer
  entity.targets = changetype<Bytes[]>(event.params.targets)
  entity.values = event.params.values
  entity.signatures = event.params.signatures
  entity.calldatas = event.params.calldatas
  entity.startBlock = event.params.startBlock
  entity.endBlock = event.params.endBlock
  entity.description = event.params.description

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProposalExecuted(event: ProposalExecutedEvent): void {
  let entity = new ProposalExecuted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.proposalId = event.params.proposalId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProposalExtended(event: ProposalExtendedEvent): void {
  let entity = new ProposalExtended(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.proposalId = event.params.proposalId
  entity.extendedDeadline = event.params.extendedDeadline

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProposalQueued(event: ProposalQueuedEvent): void {
  let entity = new ProposalQueued(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.proposalId = event.params.proposalId
  entity.eta = event.params.eta

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProposalThresholdSet(
  event: ProposalThresholdSetEvent
): void {
  let entity = new ProposalThresholdSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldProposalThreshold = event.params.oldProposalThreshold
  entity.newProposalThreshold = event.params.newProposalThreshold

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleQuorumNumeratorUpdated(
  event: QuorumNumeratorUpdatedEvent
): void {
  let entity = new QuorumNumeratorUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldQuorumNumerator = event.params.oldQuorumNumerator
  entity.newQuorumNumerator = event.params.newQuorumNumerator

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTimelockChange(event: TimelockChangeEvent): void {
  let entity = new TimelockChange(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldTimelock = event.params.oldTimelock
  entity.newTimelock = event.params.newTimelock

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleVoteCast(event: VoteCastEvent): void {
  let entity = new VoteCast(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.voter = event.params.voter
  entity.proposalId = event.params.proposalId
  entity.support = event.params.support
  entity.weight = event.params.weight
  entity.reason = event.params.reason

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
  // Update or Create ProposalVoteSummary
  updateProposalVoteSummary(
    event.params.proposalId, 
    event.params.support, 
    event.params.weight,
    event.block.timestamp
  )
}

export function handleVoteCastWithParams(event: VoteCastWithParamsEvent): void {
  let entity = new VoteCastWithParams(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.voter = event.params.voter
  entity.proposalId = event.params.proposalId
  entity.support = event.params.support
  entity.weight = event.params.weight
  entity.reason = event.params.reason
  entity.params = event.params.params

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
   // Update or Create ProposalVoteSummary
   updateProposalVoteSummary(
    event.params.proposalId, 
    event.params.support, 
    event.params.weight,
    event.block.timestamp
  )
}

export function handleVotingDelaySet(event: VotingDelaySetEvent): void {
  let entity = new VotingDelaySet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldVotingDelay = event.params.oldVotingDelay
  entity.newVotingDelay = event.params.newVotingDelay

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleVotingPeriodSet(event: VotingPeriodSetEvent): void {
  let entity = new VotingPeriodSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldVotingPeriod = event.params.oldVotingPeriod
  entity.newVotingPeriod = event.params.newVotingPeriod

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
