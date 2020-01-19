pragma solidity ^0.6.1;

abstract contract PatienceRegulationEngineLike{
	function getDonationSplit(address user) public virtual view returns (uint);
	function buyWeiDai(uint dai, uint split) public virtual;
	function claimWeiDai() public virtual;
}