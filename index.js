import QRCode from 'qrcode-generator';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// JNE Logo as base64 PNG
// To get this: convert your logo to base64 at https://base64.guru/converter/encode/image/png
// Paste the base64 string here (WITHOUT the "data:image/png;base64," prefix)
const JNE_LOGO_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAHwAAAB8CAYAAACrHtS+AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAALiMAAC4jAXilP3YAACPCSURBVHhe7X15fBzFne+3qrtndFi3bNmWbFk+ZGOb+wpXwICDAwFCDiCwWRICISEhx0sWCPtIwvFCkpeQhGOXZXMnOAtLskAIMQ48INwQbhuDfEiyDuu+j5np7vrtH9XVU9PTI83YVrD2zVefUndXV9X8qr71+1V1VXU1w34GERUMx6iOue4KMNZIxOoJqAGhlAgRAMwlgFwZ3iUCCQAEeAcvIS3RHEECAAeYOg+CBz1yB/OOQTF1f3U+JQhEDAkCjTCBbgHWwomayDC2iwnW0dDAYsEo+4KsZJoOzUQFFRN0MEiczhk7hXOsJsJcxlhUlYg8EIggneeZcg15ngwfUqIa0m6leQS91NV+yXYask41LCAB5JcPxYVALwm21SU8xUg85satt/YH+WE/nTWGhqjChbuBG+xig+N4zlkFZwBjqQmn8aARHHodgmD45EG7M1U63r1ghjOGnwLBNHxkvJGKTMEImgIQ4ArPuWLAFew5EriHEsaj9fVsMBg3W2T67SnR0UFFVrF7rsVwJTfYsYbBLM4AztPJ3h8g/184wipDGHTCpwi2T9gfedeJF4LgCMBxAdsRtuuyF0jgXwxhPFRbyyaCcadDzvL1DomjOOg6w8BZlskinAO+VudCthYw6zg6UamKHY6pNH6GEZqnUM90qGZNnQtP0x2XFPFxV7CHXUfcUr8w8ooedzpkKQLQ1CSiZVXi0oiF6yIWrzO41GhAI3oqwsPuMZbulwNSNT+d2jSfNI8ZwjSZmuZ2Sr6IAJFi4gmO42t8m+uy/zM5wn/Z2MjjgWRCMd1vAwDah0VVgaAbLAuXRy2p1TrJ2gEsJEUW5plH1iAiCCGJV9ruCoLtALYtErbA3SxhfLuujvcH4wYxLRNtfaKuyKTbohF2XsTy2ukMxO6rxuYxNYQguB7x5BFvO5L4hEu/F5P8y4sX845gPB1T8tPWJ+oKTbq7IMI+GLEA08hr63sNobRdSDPvuLJttx0g4dCf3El+xVSkZ2Svo4OqI8Xi7sIIO8+yACtP9gED1XsXql13pYlP2EDcpt8jwa/IZN5Dx5yamkTUKhI3RC12nmUCBs+TfSCBMYBzBs4lN9IxWCYQMdlHEXG/1dQkosF4yER4WZW41OR0mdTqKcxAHu8ZGJMkGxwwDNncWiZDxAJMjisKS8WngnEQRnhnLx3JDFxnWTzCVG88z/gBC6XpSttNg8GyeMQw6LqWjvgRaeH1i44OKmJcXGdxVmd4vfE8Dnz4g17eaKdpAKbJF5uW8Y3du0WhHjaFcLLcc0xGZxkGC4yc5ak/kMEUQx5nBgdMDhicziZLnK2H9QlvbaUKg+MLhsmiXG+3/dTyOGDhaSbztV116HjU4PhCczOVq6A+4Wahu4EzHKsmQXSS83wf2ND5UaSrdp0xOo4XuB9Q9zkANDdTARi7yDCY5Y+PJ9PIYxZAN8R6e24YzGIcF6vHNA4ARtQ+mIOOl6Zctt8qkTwOfOgLSBQUj5wxMEYnROc4a6EIZwY/nRusMv8INlsh6dZJVx1uj/QqYvw0AODNzVTAGE72yQ4hXJ+fzeMARQhHvmmXx1OamkSU8yKq5aA1vv3XOE+mEZJaHgcMpmJHkc4YrYmWslrO4K4Ax9y8OZ+dUIslpiRdunmu6yznjLFGBhY60A5MU33yeO9BlEJRKF2MgTFWwDlr5CCq9/x8hEbK48BGBi1XTTQDwIgWcwDzpzLllK8ABzTII0iZ9oyQrM/nBFYSvJeGqRLK4z0DeY9PKfSoCuB5pph7YqWcEWT7HSA1z/HsQC48MY4Ih7fuUEXMJYE8DkwovQ9ySQSWtgAij/8ZyNSmc90/U6A8DnDkwBmfiuQM3nkcSMiRpFSTPkXkKW7l8V4iw/xHiBeQRrhCoAcnrUCe8tkGf3xFzZyFE66znFft2QjJs/4/ecIRtiWGhjzfsxRh2s1CNDxP8CyH1qaHteN8GgWXyNeCWQfm/WNeW84YwHjgOTyPWY4wlQ74pZn0PGYvNGueEVkTnrcCsxO+afdqQ9aE53HggTEGgzPwqRY0+FovZ8lYyx5nc8TC+ojJYBreq6dce7dMrXrkco3z/oYQhN0dA5iYTExrjuBZmmjERP2iKpgGR/ueQYyMxrKKCy9+VUUxauaWBm+lYW9kKymOom5hJYQQaG0fQCxuZxV3b0CQu0FUlMv8qK2+1AZAaosQtWmA7dImtnuPs9mysD5iyXeNTUO+d/z3IrxvYAyf+eqvsau1FzyLyTtXCBx5aD3u+v5FABiuvOYevPx6Kwz1ysw0cIXA8Ucvw49vOh9FhZHg7RT0D47jM1/9NXa29GQlm+O6+NiHjsQNV5+Nzq4hXPrVX6Njz9CMlJsEQQjClz57Gi676EQ4bnKnS5cA4WqEy/1gNskXEbTuuw+NcHj3ZwLtnYPY0dyDoeFJDA6PT+sGhsZRU12CwoIIevtGsW17F4ZGJtLCZXLDo5N46rkmPP+3XUFR0pCrbMOjk1hUWwEAaGnrx67W3pxky91NYGIygUULK9MIYt4/n0Ovw8YFidBXVRRUZZgpbG/uwfhEHJwzMLm6ckpnGhyrVy4EADS39aF/cBwG52nhMjnOGMYn4viPB15GPOEExUlB065ujI3HspatqDCCVcvny7g7uxGL2d6rPjPjAGnOl9ZXp051hBCmKsD0dmqGsa1pD2wnq+EfEIDCwghWLqsBALyzvQuxmB0MNi0453j2pR146bWW4K0UbH23M2vZhCBUV87BkkVVAIC3m/bAFZnUaP9ACELdgnLUVJeC1G9pZIfw/t4SHovbeHdHd6hgYSCvUBfXVgJeoYq9mMVjDBgZjeHeB16G7Xj7eAcQi+UoGxEW11aiumoOxsbjaNqVfdy9BQFY3jAPxcX+ptUBSPOstBtqpE1CNvjy7O+D/sFxtLb3++ZpOhAR6utkoQ6NTGL7rp7UfkcO4Jzhqeeb8Npbu4O3AAA9/aNoactBNgArl89HQdRCd++I7Kzx7OLuLQzOcFDjAphG8ndSflEjmyU5RwjFweuZQWtbP3oHxsCyLBgC0Li0BtGIiT1dQ+js2vseMGMMg0MTuPfBV+C66Wa7pa0f/QNjWZNmGhyrGxcAAHa19mFgaCLryrI3IAIKCiw0LpXNWxCZfpn/vcgNQ9PObkxm+YyLQKHuaO7F8OjkPhUq5wyPP70Nb21L37jwne1dmMyyf0AEzCmOYsXSeQCAd3Z0IZ7ILq4CY4DBedaOc4Z51aWoX1SZtjZF12r9mjMG1tIZ3xyN8PURk8Ew5OCL3C6CyflTbW/VfSncMFx90+9xz+9fgmlM35UgAkrmRPHbOy/F4Qcvxndv34Q7fvYEjCziTgXXFbjkguNw87Xn+vkTRPjq9ffh/odfzUo2IQgrls7DvXdfjurKOfjCtb/Dg4++kVVcePHPOeMQnLPhMAiRbm3CQASUlhTg6MOWwDQN//lb3VMb8aYMvgjI5/BQzLDij43H0bSzJ2vtJiLMqy5F7YIKOI6Ld7Z37RcROWd49Im3sa2py/cbHY1hR3P2/QNBhIbF1agsL8bg8AR2tvTm1NSYJscZ69bgjFNW44Onrs3KnXnaWpx4zHJYluGnE/qTLNW+ZyZcYX+Uaghkx2Yw6zZSEGFpfTWqKorRNzCO5t19ORVqJjDG0NU7jPv/9Krv19E1lNMIGQNw0Ir5MAyOzq5h7OkZDi18AkBgEJ5zweAQQ3FpEZYtl01VKEjtm+2CHEc624ZIJADbARwHcB2Q4/rh4KSPMTBgCpPubf2U8rWDsFzsJR776zZ87p/uyfhYFITrCnzpslNx9RfPwEuvteCSq36B8YlEaMHmCiEItQvK8Zs7LsWKpfPw0KNv4Mv/+16ILJ+jDYPjjlsuwpmnrcEfNr2JL19/L0iQ1ysmGCCYJBAhFwVwUUAOCoWDInJQIGw0VBXiS/9wHEpMQIyNgWIx0GRMHm0blLBBiQTg2PJ5W1UAIp0cEONgpgmybUTOOgvRc86B6whtj3VsYs2d8c0FPuGAYcgxddl+y3Z8Jgi/42dP4Lt3bMp6DJxzhttuvhBnn3EIfnP/C/jn7zy4X8hWEIJw1WfW4eovnpFT/4CIUFlWiHtu+jBWzy/Gxl/8BY/+4WlUI4FKEUOFiKNMxFFCCcwRNgrJQQE5iJILCwIGyQrBoJHopTsdMmbfNFF6++2IfOhMCFv4kyfOlG34DEIIwrYdXWm9y0wgIpSVFGJZw1wAwNZ39sDNsnOTC/64+U007ezGuzuS7fl0IMYxd6QP/OtfRcdHLsRxG2/DDaMv4Sujr+JT42/j3MmdOCXejiMTPWh0BrHIHUW1mEQJ2YiSCxNCkg2ofbYAwwAzzWkdwpxhgFdVwVy+HPDqj+8EZdGGzwCGRyaxM8dO0fyaMiysKcPEZGJGRrE4Z9jdMYCfb3wGu1r7srZmBGBxrB8Fu1vg9g/AsBPgIJDXRutOtd2ePs8MhICxcAF4TU1yuFXriknCp5g8mQl0dg9hT/dw1p0iImBZ/VyUlxWhq2cEbR0DWXf2csUfHn41p/QZgOXOMCyeqZv8dwYRjOUrwEpKQKR9GNB7VHtPNHxnSy9GxmJZaxFnDKsb5SzUrtZeDM7gKFbMETlNekTJxTJnKOj93oFzWAcdJHfX1TSbPKXOMLQ6s3i7aQ9sO7veObwVLiu9acdt27sQy3EUyyKtnZwGuVQjAkM5xVHnjGWZ+syDFRbCXNmY9NAGZKA03OsXJgPNIGzbxbs7sh80ISKUlxWhYbGc83373c6sO3sAIMDwvsQeNDgjEDnROT0EgAXuOCpFDPIh7D2GEOBVVTCW1PsdNnjMqvNpXzXa3xgYGkfz7v6s228hCHULKzB/QQWGxmI5j2JxEE6Md+ADsdastTwXNDjDKCJnBlLeCxDBWLwYvHouiJJVUB7lV5zD2/AZlL55dz+6e0eyboMJwLLqQkS2vImmX9yHPR25TVkWk40lzghOibVhgTu+X7Wcg7DcHgKfyQLLBUQwV60EKyqUmWd6G8XgfWU7gBmUnYjwyGNvYWw8nnWH1jA4ap98BAMXX4LXb/slRiftrOMSGKrdSdS4E6h1x3ByvD0YZK9BAIrIQYMz7NtLVb4MBK45I4NjIjlU6n9f0s3B+fE8Z1mwDj442TMjKajspcteG2tuj22ORuVIm2nI4VX1XdH9NdJGBPQNjOK+B1/BHb94AuPj2Q+JRsjFdwefxvsSe/Dj0iPxu6KVMLKslS4YTom348ah52HBxbtmJb5ecRIGeOE+m3cBhkXuKG4f/ivmsThiLhAXDA7jSDAOGxwJZiDBDO+cw2YGEjBgMw6bGNYcsgRrDl7iD7aAy6FRGAaYwdVSYVmNyGuUXQHyyCbXBbkC5NiAacFYsQLR008HyivgunJFqxplS9gE28UmSXiEr49Y+0Z4d+8IHnl8C1xXGk1XEOIJBxOTCXT3juCtbR3Y0dwj70+Rjg4Cw3x3HLcNPoFqMYmry0/CS5H5ORH+mfEtuGxsixz0IOD7pUfhj0XLsk4jE1xBOGXNPNz5iTWIE8O37ngM73YMw+aWRy6HAw6H8ZRBF8FkVWOM49abzsd5HzwsmHTW8BQYINmBFAQIV46oud7H64T3KeqEQ3BsbGK72mKbC6I64XLpTK6E//nxLfj8NRtTVo/oG8fJyZjM8cPgguHYRBe+N/Q0BngBrqpYh05jTtZtpkECNww+i3WJDohIFEY0gtfK6nENrcWom9sjWBCuK/DFz6zDtVdtwDu7enH+Z+/GwMCYX0byf1JO/beICBVlRdh412VY463A3Rv4AyuQBkCoLxFrH6R1FeE2wVaER6NsfdTi/mxZGuH+IojMRXTrXY/h1rv+ktWEQ7YQYLhi7E1cOrYVL0bn45rykxBnyfnfqUAEVM+x8LMP1mBlw1ywuXNhVFXCmVOKr9z5VzzyxNv7JCvnDD++6Xycu+EwPPyXt3DVdb/LenaNvMUcp520CsVF0awmSoiAwkILl198EmoXyG/WZCJc/wKxkJMmiCcItqMRHrE4zDDCtU9HZyLccQSuvHYj/vTYW1mv8pgOBIYqexw/GHgSB7mD2FiyBreVHJ512+u6AkccUo977roMJUWpb5j85a/b8IVrNyIWc7LuS+hQYwMb//UyrF21EP/3XzbjJ3c/nnMFcl35TkA2ECSwtH4u7v/pFVhQUwYECFcTbcIjXrbdAQ13sIlL679vGBqNYVeOz8fTgQB8sLEUh56/AUX/9DW0HnZ8TjNkBGDlsnlpZAPA8UctxZGH1Ge9nCgIQYSFNWWonV8OxxXY1rQny2qYCsPgMM3sHOccyxvmoaqyOJhMVpA9dbUDhGr590bseAytL76Jru6hjBYgV7iuwKEHLcSVP/oyqm/9HozPX4nWomqwbNVBW8IbhuKiKD72oSMQiZjBW1mBCFhaPxflZYUYGMxtIGlvwQCsWl6DiJWlzFpZ6cWWtEEpZTlNwRLB2b0bo7/ZiP5PfxavXPc9jE1k/2w9FVxXYNmSufjW1z+EukXVAIA9nQNob+/PutNH3hsq6rWfMKw7cSXWrFyYk9VQkJM5C8AYQ3vnIHr6sh9I2ltYloHVjbl38HQm/YGXaegF895lEuPjiD39LAau+ya6L/gkBr5xPcYfewJN4wxOyBhOLiCSz42HH7wYP7zh4zj6sCX+vV2tfRgayX5JMgnC3KoS1Huv/YShsrwY5515WNYrbnREIyZWrfDeIdvVndNA0t6AiFA6pwDLvQUguSAoFpc9RI/y1ANgMAAMTls7Rn/1W/T+42XoueQyjPz0F3Da2sHLSuGuXoOW8txrnoIQBNcVKC8rwqcuPA7/+v2LcNSh9SlhtjZ1IjHNi386iAhL6ipRXTEneCsFG9atwbIlc7PuXcNLu6JcTubAm/lzQl5k2J8QRFhQU46FNf4XJdMQJDZTDfQnTVOzzEDxOBIvv4qhb9+Engs+icGbboHT1obosceg7EtfQPVtt2LBvb8Fv+NOtFfWQjgOXFdM6xzPCUGIRkwsb5iHT114PH7+o0vw7a+fjboF8nVbBdtxsWVbJ5yQtKZyK5fPRzQ6dXu3cH45zv7AIX6ly8bZtova+eWYP68UkzEb25r2QISE25/OcQSWLqlGWWnKh4JTofgN4Vl5cQBs++7xzYURY30k4j2WmRx8qB+JR/6MxLPPgEUiiB56MCIHr4W1tAFGdRVYNPlNnHd2dOPGHz6MyVhCbb2eDu/j5pGIiTnFUWlu66qwclkNVi6vwby5pZliYmQ0hm9+/yG0tPVl9VK+wpWfPhmnv/+goHcadrX24YYfPoyR0cnM8mtwhcCpJ67Cly8/FX0DY7j+uw+iq2dm23AhBC4872hc+OGjU/zJ+8CN6oGrRzL/OVx7LIsnCHEHm9j2lvHNBQXG+qjFYZoMpslguDZYPA7DMmAUFYJbRsaicF2BeHwac+uN1HHOYRo8p+dVIsJkzAZRaOUNB5PtbLa/E4vZcL1lxdOBvA5UxDIgBCEWz1G2vQB5/QbTW8Xi+3vdb9LfNPHfOAGcAOF2KuGSbEmIGnzR16bPZJby2FuowRd9ubogb0JNEBw3lXCvDddb8EzneRzISFPHgIfSV/Zu8/jmogK+PhLhsFKmSIMTKGlJ/n8HIQivb23DwOA4AKC8rAhziqMYGp7AUYcuwc7WXnT3jmDJoirsbO6FKwTq66pQv6gSr765G6PjcVgGx9qDalEQtfDKG63+mzfLG+ZhTlEUT7+4A1UVxTjuqKXgnOGl11qwp3sY7zuyAQvnp/fS9XY81KQrDbcJCRub2LvN45sLC/j6aITDMrw2PE94KMbG4/jHL/4cr21pAwCcdtIqrD95NW7/6f/DD2/4OL53+ybMrSrBqSetwvXfexAgoKG+GjdefQ6uvfkPaO8cgiDCxR85BhtOXYPLv/YbxONyedS1V21A084ubH5qG4gIN11zDirKivH1G+7HZCyBIw6px523fAJzilM/IhnacdMmT3STnrD1N0/y1ntajI7F0NM/hgs/fDTuuOUTuPLTp+D4o5bCNA189/ZNaN7dj0suOA4jo5OoqS7F1z6/Hv0DY3h9SxvGJxL42ufX49wNh+L1rW3Y0dKLaMTE9f/rLNxxy4VYu2ohnv/bLnz+kvfj3A2Hob1zCE8934QFNWW48epzwBgwODwRFEkOigUtuNdJTvHyruWGAMEBlzxCMTQ8gbGxGIZHJtGyux8FEQuLaitxxCGL8fzfduG096/CsUc2YHfHoG/uDcPA+EQCiYQDyzIwMjqJkjkFGBgch+0IdHQNobt3FFUVxTAMjvseegXHHrEEl3/yJBQXRbH13U68vrUdN19zLuq8adFMYBqx/rVWGRhTH7mRRiEZMo9Q9PaPIRa38eKrzfjN/S+gs1u+gBCxTBQXRfHhDXKotrt3BFve6cCNP/wTDl61ECVzCjAyGsN3fvJnvPx6K84/50gMjUxgYjKO/3rkNTz06BuoKC/GZRefiK6eEdx06yNoaevDx84+AoeursPPNz6L3z3w8tTNqsasf8q8eW0NaWPpedozY0/PMMpKi/Dvt34SD/7qSpx8fCNe39qGzU+9Dcdx0dY5iFjcRnfPCI4/ehluvOYc3HTtuRgbj2HJ4iqccMwyrGiYh3UnrER75yBOPXEVHvzVlbj7B/+A9s4B1MwtxY9u/DjiCRtPv7ADb23rwDe/9iGcsW4NXvjbroxbkOhmnSlzHuBanXOQHAfOEz09OruGMD4RxwN/fh2/vu8FNO3sxi//4zmUFEdx1KH1ePLZd9HbP4b+oXF84OTVuODco7CgpgztnYNYXFuJc884FM27+7Btexf6B8fR3jmIX933Ah569A088vgW3PyjR9DbP4aCqAXbdvGdH/8Zm57YCssyMKc4mtPiEqnhyaOCP5YuodbLJAPkkcTwyCRs28W9D/wNv/uvl/D40+/gxVdbcMkFx+GijxyDlrZ+NO3shmlwfxmS7bgYGY2hbmEFDl1ThznFUbzyRiscR2DX7j78bOMz+MuT23DSsSsghMANP/gjltZX4+wzDsEJxyzDT+95Bs+/vBPnnXl4yvYeQTDPfIdpuE46e2fXyObCqCkfy0w5lq6exfOPZaloaev3XmSUq1XmFEcxMhrD8oa5IAJa2vowr7oUPX2jqK+rRMmcAghB2NHSg+LCKGrmlmL7rm4UFUUwPp5A3HYAb3OehsXV2L6rGx1dwziocT4WzCvD0PAE3ny7AyUlBTj4oNppNVyNurnao5ntEGxHPofHE9jEtu0Y2VxYaKwviBgBwtWatjzhswX6MKu/64PrEZ4gxBKBHSCSPfY8ZiN8s6534JJ3AQBceG12+seH85iN8DtrfofNm/T1mOcEktNsKXzn6Z/N8LU6tJeuvUesWCbtPI/ZBdXXUhruH737/sCLdMkdlfOYvdDJTmFbEu4twMsz/T8LHskBvsEFaV22gGlPO89j1sA35x7jnqUnDrA4+T31QHctT/ashN+Oq2t1g5DgAI0mO+nyJM/z7EdweJUIIEYjnATtkSM0yTcR/QDq3DvmMXtBABihi7uE3UIkd+wDySG6tNB5zFoQydevBLFWTkRNrhBxSTpB+Ns1elqfZ3tWg9RWIEQxImrigoztrose4e0HIveOSd2jkxCi9XnMCpC3sJEIPYKMHXysb7CDBL3teLv+KOKTmq5XgDzpswXk7Qoh93khuIJt4Ql08nXrGmKuwJPyPSRp0tPMuq/lSb88Dkz4nHlKq7Z0A+HJxkYe5wBgC/cx23UHVG1Q7bnScMl2kvSUhANuNiAoc9DNRuiyk5oT9+bDHUH9LnMfhxpLn+gf2+I49KztCG1DN514LzGtEvhan+GH3+uCC5KYSa6U/Gj9lWC4AxHBPOn5kK9AyxcRSLBnaNzaCkX4unUNMUdgo227tuMQHEcGVvt8+dtBEfwJFoKm+SFOF+jvhbQCCCM0TE7Nqfyo9A4UBCtt5jzKJtl1CbZDcF2RYAz3NDbyOPxFjADGHb7JtukF2xHeO0lJLVdaL4RsG+Twu0e87lShaULows4UMtVyJYxOqO+C4bwM+PnQCnAmZZ8OU5MbcCAIkmY84UjnEnveiRqbVXo+4esOrxhyCHfGE248hfSAiVfbOfqFof95v5wUICmMEn5/wq/twd/JSGjSBeVOyY+6TtaD94T4YCWGkiXFT8osvD1yHJdg24SETXBdioHYncsq2bBKM2VNG4/H/mjb9HDCFlDtud6Rk6shNeLJe24Pfj3HEwIzUHA+yRrRfkEECiFJnlYJgy7YZGmVWcnvZSVF/n3JQzbQ86c7KVMyb+ptUdleExxHIGEL2DaBwB5iNn9YT1efKgUAPPdGzxEFpvlAUYGxqLDAQMTisEy5LSfnDCzle2bJ6OqUeRfyqE3EQ8ZVgfQfnm5FbLBw9UvS/iXPk/4pMbWIun+QOzmtKOWViwmkwKkyaxdTYLq8BaHyqiqYzEMyI0pUVSnVUb41Ks14PEFwibVyhg/X1URf9xMPIxwAXn6t9wqrgN9WXGBFolEDEYvBMOQXbeVH7Ji3/2oYiUm/0IILFFa25RFOsk9zUhMDhebHCZAqkVpJfHiyMvWxXZUHVVwB8lOg5033zxJKTpWPFM3WwuiE++ZckS0QN0x+Ve286L/raSOTTFu2bIlMuDU/KIyaVxUVmohYHIYp3xnXtwJJFoQHpdmKSK+Q5Aa96cRPWXABpBKTJMorCz/zUAWl3U8mkIrkvfSbasmvsmTKujEk85UMrEVMv8wJvty+uVZ50fLkab0aXJEv/wskbILjAKZl/KR2XuRqxlgimH5G2V58sb2KFxb+W2GB8dHCAiNlZwhl3rmmvdA12/snj0nzLzUm+4JLJSkzyaoAkoWhFVAyethp0k/z1OWX+QtU8LSKnoyb7hVyE5p3SB7JI1qofpLnqROuRkSFK8mWb5gQLMv4z9LC6OfKy/mAnrJCBmkknnutr9Yy8W+FUfOsaERu8prUctWWa6QrAvXC8i580lWTECy4TJJ4BRJKstaxUQWS1HIZK0R5fej39HYymA/VhKXJ7cmsKryOsMqQKYtQ2fSIJJKdMH0+Q+VFdiyTHWdXSKIdh2Bw9seSQva5uXOLO4PpK0wlA+CRHjHYTyIR/tFIhMMykh04ucNTOHl+gakv03thlKYkN94PWAnvd1XZ+wTLi1Cy1bUXJHkeIDVVm5Q++Rcpt/18KMuUhZaHUa4qRfBch5JRN+PSafn3K4P0d9VImiO1m3H8Z2GJ+ZX6KchGNoTDM++sIPot0+RXRC0jorb3UlquCFRE6zVfForXyfPC+b39QOHJSFIoVeN90jTi07Q84I9AIepIuUqrAEn44vh5CbdqzAugKoiOZGXQGq5giWuVWZpvfdArhHDv8dgV8tErYbtxxthdvIjduHZxeagZ1xH8+YzYsmVLZMyu+bTJ2T+bFl+kHtWS7bmWeVXbVUa1wvE7QUx25PT2XUbXRdLbaD3zqYTDI1iehnfYAtxqUDUjPYySR4mV1oFTsnv3k+Kn9EySlTlwDk1uXbuT8xhqpYp3X9Ns2xGwE+5uh9jNxUblr9auTe+ghSFrwhWee7nnCGayb5gGO9syeTS541OgILwS0AtDN4NppjFQeEnFTCUdKRqdvO/d0o5eRUieZsRUt/0C8vLE9P4IS/VPhktCr8RBslUlUxVY9bhlZy21F64qgjThIu4IekiAbjnhsHmvBVKdEkERssJzz+0uZNGCc8DZlYaB40zOLW4wGIylPX6pTCaPutbrFUB66oWSJCugtTr5WmB1nmbGp2I0S6TIr+UvWZn9kGnEBq91JCuvR7BHtlqEotpyV25KnBACzwuX7kQi9vDxxy+eDKY3HaYQZXo88dpguSXsMzjDRYyzEwzGqlI03SsgBDIdSr539FnTz4NamGaucyN4uvsKYUT58mr50rhOGvOApiOQni6DtGBah00nXxAcon5y6RmXsNExrM3rDq/Y688ZB2XaKzzS1BQtGa1YyyFOB+OncEarGbEaxlk0Sa4eI1lYySvtJEB0gPtUBG4EqE+52nd4cidPNd/kSWpWU4s4LYuelVKkkxwbjxFEjxBsK0E8SeCPj3YPbjnzzMZ4MqW9w34hXMcjTU3RkqHSWsbYcgIaGccSRqwGQCmBRXTy/B+feieLzMhhX/psqN/rwsggfwbvFAgCgZHNBIYFQzcjaiHCdiLaMVo+0nFm476TrOO/AbjFQ7CSnYLZAAAAAElFTkSuQmCC';

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      const url = new URL(request.url);
      if (url.pathname === '/generate-visitor-card') {
        const params = Object.fromEntries(url.searchParams);
        
        const pdfBytes = await generateVisitorCard(params);
        
        return new Response(pdfBytes, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${safeName(params.company || 'Company')}-${safeName(params.name || 'Name')}-${safeName(params.date || 'Date')}.pdf"`
          }
        });
      }
      
      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders 
      });
    } catch (error) {
      console.error('Generation Error:', error);
      return new Response(`Error: ${error.message}`, { 
        status: 500,
        headers: corsHeaders 
      });
    }
  }
};

async function generateVisitorCard({
  name = '',
  visitorNumber = '',
  company = 'Company Name',
  date = '01-01-2026'
} = {}) {
  if (!name || !visitorNumber) {
    throw new Error('Name and Visitor Number are required');
  }

  try {
    const pdfDoc = await PDFDocument.create();
    
    // Card dimensions: 85.6mm x 140mm (ID card proportions)
    const cardW = mmToPt(85.6);
    const cardH = mmToPt(140);
    const page = pdfDoc.addPage([cardW, cardH]);
    
    const fontR = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontB = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Colors
    const darkBlue = rgb(39/255, 67/255, 125/255);
    const white = rgb(1, 1, 1);
    const black = rgb(0, 0, 0);

    // === LAYOUT ZONES ===
    const whiteZoneHeight = cardH * 0.25;
    const blueZoneHeight = cardH - whiteZoneHeight;

    // --- WHITE BOTTOM SECTION ---
    page.drawRectangle({ 
      x: 0, 
      y: 0, 
      width: cardW, 
      height: whiteZoneHeight, 
      color: white 
    });

    // --- BLUE TOP SECTION ---
    page.drawRectangle({ 
      x: 0, 
      y: whiteZoneHeight, 
      width: cardW, 
      height: blueZoneHeight, 
      color: darkBlue 
    });

    // === LOGO AREA (Top of blue section) ===
    const logoBoxSize = 50;
    const logoBoxX = (cardW - logoBoxSize) / 2;
    const logoBoxY = cardH - logoBoxSize - 15;
    const logoCornerRadius = 8;

    // White rounded rectangle for logo
    drawRoundedRect(page, logoBoxX, logoBoxY, logoBoxSize, logoBoxSize, logoCornerRadius, white);

    // Embed logo if available
    if (JNE_LOGO_BASE64) {
      try {
        const logoBytes = base64ToBytes(JNE_LOGO_BASE64);
        const logoImg = await pdfDoc.embedPng(logoBytes);
        
        // Logo fills entire box, no padding
        const logoAspect = logoImg.width / logoImg.height;
        
        let logoW, logoH;
        if (logoAspect > 1) {
          logoW = logoBoxSize;
          logoH = logoBoxSize / logoAspect;
        } else {
          logoH = logoBoxSize;
          logoW = logoBoxSize * logoAspect;
        }
        
        const logoX = logoBoxX + (logoBoxSize - logoW) / 2;
        const logoY = logoBoxY + (logoBoxSize - logoH) / 2;
        
        page.drawImage(logoImg, {
          x: logoX,
          y: logoY,
          width: logoW,
          height: logoH
        });
      } catch (logoError) {
        console.error('Logo embed failed:', logoError);
        drawLogoPlaceholder(page, logoBoxX, logoBoxY, logoBoxSize, fontB);
      }
    } else {
      drawLogoPlaceholder(page, logoBoxX, logoBoxY, logoBoxSize, fontB);
    }

    // === QR CODE ===
    const qrPngBytes = generateQRCodePNG(visitorNumber);
    const qrImg = await pdfDoc.embedPng(qrPngBytes);
    
    const qrSize = cardW * 0.60;
    const qrX = (cardW - qrSize) / 2;
    const qrY = logoBoxY - qrSize - 15;
    
    // QR sudah punya white margin internal dari generateQRCodePNG
    // Jadi tidak perlu padding tambahan di sini
    page.drawImage(qrImg, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize
    });

    // === VISITOR TEXT (below QR, in blue zone) ===
    const visitorText = "VISITOR";
    const visitorFontSize = 22;
    const visitorTextWidth = fontB.widthOfTextAtSize(visitorText, visitorFontSize);
    const visitorY = qrY - 30;
    
    page.drawText(visitorText, {
      x: (cardW - visitorTextWidth) / 2,
      y: visitorY,
      size: visitorFontSize,
      font: fontB,
      color: white
    });

    // === VISITOR NUMBER (below VISITOR text) ===
    const visitorNumFontSize = 12;
    const visitorNumWidth = fontR.widthOfTextAtSize(visitorNumber, visitorNumFontSize);
    
    page.drawText(visitorNumber, {
      x: (cardW - visitorNumWidth) / 2,
      y: visitorY - 20,
      size: visitorNumFontSize,
      font: fontR,
      color: white
    });

    // === WHITE SECTION CONTENT ===
    const companyFontSize = 14;
    const companyWidth = fontR.widthOfTextAtSize(company, companyFontSize);
    const companyY = whiteZoneHeight - 33;
    
    page.drawText(company, {
      x: (cardW - companyWidth) / 2,
      y: companyY,
      size: companyFontSize,
      font: fontR,
      color: black
    });

    const nameFontSize = 15;
    const nameWidth = fontB.widthOfTextAtSize(name, nameFontSize);
    
    page.drawText(name, {
      x: (cardW - nameWidth) / 2,
      y: companyY - 20,
      size: nameFontSize,
      font: fontB,
      color: black
    });

    const dateFontSize = 13;
    const dateWidth = fontR.widthOfTextAtSize(date, dateFontSize);
    
    page.drawText(date, {
      x: (cardW - dateWidth) / 2,
      y: companyY - 40,
      size: dateFontSize,
      font: fontR,
      color: darkBlue
    });

    return await pdfDoc.save();

  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error(`Failed to generate visitor card: ${error.message}`);
  }
}

function drawLogoPlaceholder(page, boxX, boxY, boxSize, font) {
  page.drawText("JNE", {
    x: boxX + 8,
    y: boxY + 18,
    size: 14,
    font: font,
    color: rgb(0.8, 0.1, 0.1)
  });
}

function base64ToBytes(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function drawRoundedRect(page, x, y, width, height, radius, color) {
  page.drawRectangle({
    x: x + radius,
    y: y,
    width: width - (radius * 2),
    height: height,
    color: color
  });
  
  page.drawRectangle({
    x: x,
    y: y + radius,
    width: width,
    height: height - (radius * 2),
    color: color
  });
  
  const corners = [
    { cx: x + radius, cy: y + radius },
    { cx: x + width - radius, cy: y + radius },
    { cx: x + radius, cy: y + height - radius },
    { cx: x + width - radius, cy: y + height - radius }
  ];
  
  for (const corner of corners) {
    page.drawCircle({
      x: corner.cx,
      y: corner.cy,
      size: radius,
      color: color
    });
  }
}

/**
 * Generate QR Code as PNG bytes
 * margin = 2 (reduced from 4 for thinner white border)
 */
function generateQRCodePNG(text) {
  const qr = QRCode(0, 'H');
  qr.addData(text);
  qr.make();

  const moduleCount = qr.getModuleCount();
  const cellSize = 10;
  const margin = 2; // Reduced from 4 - thinner white border
  const size = (moduleCount + margin * 2) * cellSize;

  const pixels = new Uint8Array(size * size * 4);
  
  // Fill with white background
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = 255;
    pixels[i + 1] = 255;
    pixels[i + 2] = 255;
    pixels[i + 3] = 255;
  }

  // Draw black modules
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        const startX = (col + margin) * cellSize;
        const startY = (row + margin) * cellSize;
        
        for (let py = 0; py < cellSize; py++) {
          for (let px = 0; px < cellSize; px++) {
            const idx = ((startY + py) * size + (startX + px)) * 4;
            pixels[idx] = 0;
            pixels[idx + 1] = 0;
            pixels[idx + 2] = 0;
            pixels[idx + 3] = 255;
          }
        }
      }
    }
  }

  return encodePNG(pixels, size, size);
}

function encodePNG(pixels, width, height) {
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = createIHDRChunk(width, height);
  const idat = createIDATChunk(pixels, width, height);
  const iend = createIENDChunk();

  const png = new Uint8Array(
    signature.length + ihdr.length + idat.length + iend.length
  );
  
  let offset = 0;
  png.set(signature, offset); offset += signature.length;
  png.set(ihdr, offset); offset += ihdr.length;
  png.set(idat, offset); offset += idat.length;
  png.set(iend, offset);

  return png;
}

function createIHDRChunk(width, height) {
  const data = new Uint8Array(13);
  const view = new DataView(data.buffer);
  
  view.setUint32(0, width, false);
  view.setUint32(4, height, false);
  data[8] = 8;
  data[9] = 6;
  data[10] = 0;
  data[11] = 0;
  data[12] = 0;

  return createChunk('IHDR', data);
}

function createIDATChunk(pixels, width, height) {
  const rawData = new Uint8Array(height * (1 + width * 4));
  
  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 4);
    rawData[rowStart] = 0;
    
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = rowStart + 1 + x * 4;
      rawData[dstIdx] = pixels[srcIdx];
      rawData[dstIdx + 1] = pixels[srcIdx + 1];
      rawData[dstIdx + 2] = pixels[srcIdx + 2];
      rawData[dstIdx + 3] = pixels[srcIdx + 3];
    }
  }

  const compressed = deflateSync(rawData);
  return createChunk('IDAT', compressed);
}

function createIENDChunk() {
  return createChunk('IEND', new Uint8Array(0));
}

function createChunk(type, data) {
  const chunk = new Uint8Array(4 + 4 + data.length + 4);
  const view = new DataView(chunk.buffer);
  
  view.setUint32(0, data.length, false);
  
  for (let i = 0; i < 4; i++) {
    chunk[4 + i] = type.charCodeAt(i);
  }
  
  chunk.set(data, 8);
  
  const crcData = new Uint8Array(4 + data.length);
  for (let i = 0; i < 4; i++) {
    crcData[i] = type.charCodeAt(i);
  }
  crcData.set(data, 4);
  view.setUint32(8 + data.length, crc32(crcData), false);
  
  return chunk;
}

function deflateSync(data) {
  const blocks = [];
  const BLOCK_SIZE = 65535;
  
  blocks.push(new Uint8Array([0x78, 0x01]));
  
  let offset = 0;
  while (offset < data.length) {
    const remaining = data.length - offset;
    const blockLen = Math.min(remaining, BLOCK_SIZE);
    const isLast = offset + blockLen >= data.length;
    
    const header = new Uint8Array(5);
    header[0] = isLast ? 0x01 : 0x00;
    header[1] = blockLen & 0xFF;
    header[2] = (blockLen >> 8) & 0xFF;
    header[3] = ~blockLen & 0xFF;
    header[4] = (~blockLen >> 8) & 0xFF;
    blocks.push(header);
    
    blocks.push(data.slice(offset, offset + blockLen));
    
    offset += blockLen;
  }
  
  const adler = adler32(data);
  const adlerBytes = new Uint8Array(4);
  adlerBytes[0] = (adler >> 24) & 0xFF;
  adlerBytes[1] = (adler >> 16) & 0xFF;
  adlerBytes[2] = (adler >> 8) & 0xFF;
  adlerBytes[3] = adler & 0xFF;
  blocks.push(adlerBytes);
  
  const totalLen = blocks.reduce((sum, b) => sum + b.length, 0);
  const result = new Uint8Array(totalLen);
  let pos = 0;
  for (const block of blocks) {
    result.set(block, pos);
    pos += block.length;
  }
  
  return result;
}

function crc32(data) {
  let crc = 0xFFFFFFFF;
  
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function adler32(data) {
  let a = 1;
  let b = 0;
  const MOD = 65521;
  
  for (let i = 0; i < data.length; i++) {
    a = (a + data[i]) % MOD;
    b = (b + a) % MOD;
  }
  
  return ((b << 16) | a) >>> 0;
}

function mmToPt(mm) { 
  return (mm * 72) / 25.4; 
}

function safeName(s) { 
  return String(s || "")
    .trim()
    .replace(/[^a-z0-9_\- ]/gi, "_")
    .replace(/\s+/g, "_"); 
}

// https://visitor-pdf-service.aliphamjah.workers.dev/generate-visitor-card?name=Alip%20Hamjah&visitorNumber=VIS-001&company=Google&date=20-12-2025