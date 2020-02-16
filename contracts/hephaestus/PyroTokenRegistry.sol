pragma solidity ^0.6.1;

import "../../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "./PyroToken.sol";
import "./Validator.sol";

contract PyroTokenRegistry is Secondary{
	address public PatienceRegulationEngine;
	mapping (address=>address) public baseTokenMapping;
	mapping (address=>address) public pyroTokenMapping;
	address public bellows;
	address public kharon;
	Validator validator;

	function seed(address b, address v, address k) external onlyPrimary {
		bellows = b;
		validator = Validator(v);
		kharon = k;
	}

	function addToken(string calldata name, string calldata symbol, address baseToken) external onlyPrimary {
		require(validator.tokens(baseToken),"invalid token");
		PyroToken t = new PyroToken(name, symbol, baseToken, bellows, kharon, address(this));
		address pTokenAddress = address(t);
		baseTokenMapping[baseToken] = pTokenAddress;
		pyroTokenMapping[pTokenAddress] = baseToken;
		require(address(t) != address(0),"deploy contract failed");
	}
}