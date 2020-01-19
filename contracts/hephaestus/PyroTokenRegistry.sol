pragma solidity ^0.6.1;
import "../../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "./PyroToken.sol";
import "./Validator.sol";

contract PyroTokenRegistry is Secondary{
	address public PatienceRegulationEngine;
	mapping (address=>address) public baseTokenMapping;
	address public bellows;
	Validator validator;

	function seed(address b, address v) public {
		bellows = b;
		validator = Validator(v);
	}

	function addToken(string memory name, string memory symbol, address baseToken) public onlyPrimary {
		require(validator.tokens(baseToken),"invalid token");
		PyroToken t = new PyroToken();
		t.seed(name, symbol, baseToken, bellows, address(this));
		baseTokenMapping[baseToken] = address(t);
		require(address(t) != address(0),"deploy contract failed");
	}
}