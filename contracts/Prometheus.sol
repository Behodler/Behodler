/*
	Prometheus takes a portion of the fees from Kharon, wraps as a Pyrotoken and gives it to the user as a reward.
	If the input token is scx, dai or weidai, Prometheus doesn't take any.
	A simple implementation of Prometheus immediately hands over the reward to the user. 
	A more complex version might hold onto rewards for 10 trades or 1 month before handing over. We'll have to see. The benefit of handing over after many trades:
		1. Incentive for user to trade often
		2. Can increase reward over time, rewarding frequent traders.
		3. When reward finally comes through, it looks large
	Downsides:
		1. added complexity
		2. users might get disinterested, waiting for pyrotokens.

	Probably no need to give users the ability to engulf (wrap) tokens into pyrotokens. These tokens are for rewards only.
 */