pragma solidity ^0.6.1;

import "../../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "../Scarcity.sol";

/*
	Lachesis, one of the three Moirai, the inflexible, decides which tokens are active within behodler.
 */

contract Lachesis is Secondary{
	mapping (address => bool) public tokens;
	Scarcity public scarcity;

	function measure (address token, bool valid) external onlyPrimary {
		tokens[token] = valid;
	}

	function setScarcity(address s) external onlyPrimary {
		scarcity = Scarcity(s);
	}

	function cut(address token) external view {
		require(tokens[token],"invalid token.");
	}
}