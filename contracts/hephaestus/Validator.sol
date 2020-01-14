pragma solidity 0.5;
import "../../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "../Scarcity.sol";

contract Validator is Secondary{
	mapping (address => bool) public tokens;
	Scarcity public scarcity;

	function setValid (address token, bool valid) public onlyPrimary {
		tokens[token] = valid;
	}

	function setScarcity(address s) public onlyPrimary {
		scarcity = Scarcity(s);
	}
}