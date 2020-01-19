pragma solidity  0.6;
import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";


contract MockToken2 is ERC20
{
	constructor() public {
		_mint(msg.sender,1000000000 ether);
	}
}