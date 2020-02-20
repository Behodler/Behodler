pragma solidity ^0.6.0;
abstract contract KharonLike {
	function toll(address token, uint value) public virtual view returns (uint);
	function demandPayment (address token, uint value, address buyer) external virtual returns (uint);
	function withdrawDonations(address token) external virtual;
}