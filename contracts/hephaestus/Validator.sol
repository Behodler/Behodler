pragma solidity 0.5.11;
import "../../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";

contract Validator is Secondary{
	mapping (address => bool) public tokens;

	function setValid (address token, bool valid) public onlyPrimary {
		tokens[token] = valid;
	}
}