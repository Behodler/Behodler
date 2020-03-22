pragma solidity  0.6;
import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";


contract MockWeth is ERC20
{
	function deposit () external payable {
		_mint(msg.sender,msg.value);
	}

	function withdraw(uint value) external {
		_burn(msg.sender,value);
		address payable sender = msg.sender;
		(bool success, ) = sender.call.value(value)("");
		require(success, "Unwrapping failed.");
	}
}