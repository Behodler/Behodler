pragma solidity  0.5;
import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";


contract MockWeth is ERC20
{
	function deposit () public payable {
		_mint(msg.sender,msg.value);
	}

	function withdraw(uint value) public {
		_burn(msg.sender,value);
		(bool success, ) = msg.sender.call.value(value)("");
		require(success, "Unwrapping failed.");
	}
}