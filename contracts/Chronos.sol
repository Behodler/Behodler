pragma solidity ^0.6.1;
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
/*
	Chronos is an oracle that records the trades of Behodler over time.
	While one would think that logging would suffice, this isn't accessible to contracts.
	Chronos keeps a moving average of the last 10, 100 and 1000 trades for a token pair.
	This provides attack resistant stability for anyone wishing to use it as an oracle.
	Scarcity (Scx) is the unit of account in the Behodler dapp and so all data is recorded in
	terms of Scarcity
 */


contract RingAverage{
	uint[] public data;
	uint[] public blockStamp;
	uint public total;
	uint public first;
	uint public last;
	uint length;

	constructor (uint l) public {
		length = l;
		first = 0;
		last = l-1;
	}

	function push(uint value) external {
		total += value;

		if(data.length < length) {
			data.push(value);
			blockStamp.push(block.number);
		}
		else{
			total -= data[first];
			first = (first + 1) % length;
			last = (last + 1) % length;
			data[last] = value;
			blockStamp[last] = block.number;
		}
	}

	function calculatedAverage() external view returns (uint) {
		return total/data.length;
	}
}


contract Chronos is Secondary {
	address behodlerAddress;
	using SafeMath for uint;
	mapping (address => bool) initialized;
	mapping (address => RingAverage[]) public stampData; // tokens per billion scx
	uint BILLION = 10**9;

	modifier onlyBehodler(){
		require(behodlerAddress != address(0), "Behodler contract not set.");
		require(msg.sender == behodlerAddress, "Only the Behodler contract can invoke this function.");
		_;
	}

	function seed (address beh) external {
		behodlerAddress = beh;
	}

	function stamp(address tokenAddress, uint scxValue, uint tokenValue) public onlyBehodler {
		uint gigaValue = tokenValue*BILLION;
		if(gigaValue<scxValue)
			return;
		uint average = gigaValue/scxValue;
		if(!initialized[tokenAddress]){
			stampData[tokenAddress].push(new RingAverage(10));
			stampData[tokenAddress].push(new RingAverage(100));
			stampData[tokenAddress].push(new RingAverage(1000));
			initialized[tokenAddress] = true;
		}

		stampData[tokenAddress][0].push(average);
		stampData[tokenAddress][1].push(average);
		stampData[tokenAddress][2].push(average);
	}
}