pragma solidity ^0.6.1;

abstract contract WeiDaiBankLike {
	function redeemWeiDai(uint weiDai) external virtual;
}