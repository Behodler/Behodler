pragma solidity ^0.6.1;


abstract contract BehodlerLike {
    function tokenScarcityObligations(address token) public virtual returns (uint);

    function buyScarcityDelegate(
        address sender,
        address tokenAddress,
        uint256 value,
        uint256 minPrice
    ) external virtual returns (uint256);

    function sellScarcityDelegate(
        address sender,
        address tokenAddress,
        uint256 value,
        uint256 maxPrice
    ) external virtual returns (uint256);
}
