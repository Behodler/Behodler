pragma solidity ^0.6.1;
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
/*
	Chronos is an oracle that records the trades of Behodler over time.
	While one would think that logging would suffice, this isn't accessible to contracts.
	Chronos keeps a moving average of the last 10, 100 and 1000 trades for a token pair.
	This provides attack resistant stability for anyone wishing to use it as an oracle.
	Scarcity (Scx) is the unit of account in the Behodler dapp and so all data is recorded in
	terms of Scarcity
 */



contract Chronos is Secondary {
	address behodlerAddress;

	modifier onlyBehodler(){
		require(behodlerAddress != address(0), "Behodler contract not set.");
		require(msg.sender == behodlerAddress, "Only the Behodler contract can invoke this function.");
		_;
	}

	function seed (address beh) external {
		behodlerAddress = beh;
	}

	function stamp(address tokenAddress, uint scxValue, uint tokenValue) public onlyBehodler {
	}
}