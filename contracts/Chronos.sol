/*
	Chronos is an oracle that records the trades of Behodler over time.
	While one would think that logging would suffice, this isn't accessible to contracts.
	Chronos keeps a moving average of the last 10, 100 and 1000 trades for a token pair.
	This provides attack resistant stability for anyone wishing to use it as an oracle.
	Trading pairs can be held as mapping(address=>mapping(address=uint)). If a pair of [X][Y] has a non zero value and a [Y][X] trade comes in, then it is
	just inverted and added to the [X][Y] running average.
 */

