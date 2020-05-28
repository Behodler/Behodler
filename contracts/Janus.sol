pragma solidity ^0.6.1;
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./contractFacades/ERC20Like.sol";
import "./Behodler.sol";
import "./contractFacades/WethLike.sol";


/*
	Janus will be used by the front end to execute a token to token swap without requiring the user know about scarcity.
	If trading pair involves scarcity then only one arm of the Behodler need be invoked.
	If either of the token is Eth, Janus first wraps (or unwraps) it before swapping the weth. Behodler doesn't deal in Eth.
	Developers building on top of Behodler trading functionality should treat Janus as their portal.
 */

contract Janus is Secondary {
    Behodler public behodler;
    address public scarcityAddress;
    WethLike public weth;
    using SafeMath for uint256;
    address self;

    constructor() public {
        self = address(this);
    }

    receive() external payable {}

    function seed(
        address scx,
        address wet,
        address beh
    ) external onlyPrimary {
        weth = WethLike(wet);
        scarcityAddress = scx;
        behodler = Behodler(beh);
    }

    function addLiquidityTokens(
        address sender,
        address token1,
        address token2,
        uint256 v1,
        uint256 v2
    ) private returns (uint256 bought) {
        bought = behodler.buyScarcityDelegate(sender, token1, v1, 0);
        bought += behodler.buyScarcityDelegate(sender, token2, v2, 0);
    }

    function addLiquidityTokens(
        address token1,
        address token2,
        uint256 v1,
        uint256 v2
    ) external returns (uint256 bought) {
        bought = addLiquidityTokens(msg.sender, token1, token2, v1, v2);
    }

    //user must authorize weth for Janus
    function addLiquidityTokenAndEth(address token, uint256 v1)
        external
        payable
        returns (uint256 bought)
    {
        require(msg.value > 0, "no eth sent");
        weth.deposit.value(msg.value)();
        weth.transfer(msg.sender, msg.value);
        bought = addLiquidityTokens(
            msg.sender,
            token,
            address(weth),
            msg.value,
            v1
        );
    }

    //user must authorize behodler to take input token
    function tokenToToken(
        address input,
        address output,
        uint256 value,
        uint256 minPrice,
        uint256 maxPrice
    ) external returns (uint256 bought) {
        return
            tokenToToken(msg.sender, input, output, value, minPrice, maxPrice);
    }

    function tokenToToken(
        address sender,
        address input,
        address output,
        uint256 value,
        uint256 minPrice,
        uint256 maxPrice
    ) private returns (uint256 bought) {
        require(
            input != output,
            "input token must be different to output token"
        );
        if (input == scarcityAddress) {
            bought = behodler.sellScarcityDelegate(
                sender,
                output,
                value,
                maxPrice
            );
        } else if (output == scarcityAddress) {
            bought = behodler.buyScarcityDelegate(
                sender,
                input,
                value,
                minPrice
            );
        } else {
            uint256 scx = behodler.buyScarcityDelegate(
                sender,
                input,
                value,
                minPrice
            );
            uint256 max = behodler.tokenScarcityObligations(output);
            uint256 scxToSend = scx > max ? max : scx;
            bought = behodler.sellScarcityDelegate(
                sender,
                output,
                scxToSend,
                maxPrice
            );
        }
    }

    function ethToToken(
        address output,
        uint256 minPrice,
        uint256 maxPrice
    ) external payable returns (uint256 bought) {
        // user needs to enable eth for behodler
        require(msg.value > 0, "no eth sent");
        weth.deposit.value(msg.value)();
        weth.transfer(msg.sender, msg.value);
        bought = tokenToToken(
            msg.sender,
            address(weth),
            output,
            msg.value,
            minPrice,
            maxPrice
        );
    }

    function tokenToEth(
        address input,
        uint256 value,
        uint256 minPrice,
        uint256 maxPrice
    ) external returns (uint256 bought) {
        //user must authorize weth for Janus
        bought = tokenToToken(
            msg.sender,
            input,
            address(weth),
            value,
            minPrice,
            maxPrice
        );
        weth.transferFrom(msg.sender, self, bought);
        weth.withdraw(bought);
        (bool success, ) = msg.sender.call.value(bought)("");
        require(success, "Transfer failed.");
    }
}
