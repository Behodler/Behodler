/*
	Swap will be used by the front end to execute a token to token swap without requiring the user know about scarcity.
	If trading pair involves scarcity then only one arm of the Behodler need be invoked.
	If either of the token is Eth, Swap first wraps (or unwraps) it before swapping the weth.
 */