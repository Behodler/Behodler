/*
	Kharon exacts fees from input tokens in a behodler trade. If the input token is a pyrotoken, the fee is used to increase the reserve.
	If the token is dai, it is used to instantly buy and burn WeiDai. If the token is WeiDai or Scarcity, it is burnt. Burning scarcity helps to gradually
	increase the liquidity pool of the output token.
	Kharon has logic for knowing when to stop burning scarcity (too much liquidity)
	It also has logic for knowing when to not charge a fee. For instance, the user could have an NFT that exempts fees. This can be an external dependency.
	Before burning, Kharon asks Prometheus how much 'he' wants.
 */