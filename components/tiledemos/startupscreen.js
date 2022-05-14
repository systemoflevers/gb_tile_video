import { TwoBitDrawing } from "../twobitdrawing.js";

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<style>
  #container {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow-y: clip;
  }

  two-bit-drawing {
    height: 100%;
    aspect-ratio: 160 / 144;
    position: absolute;
  }

  #moving-drawing {
    transform: translateY(-70%);
    transition: transform 5s linear;
    visibility: hidden;
  }
  #moving-drawing.down {
    transform: translateY(0);
    visibility: visible;
  }

  #off-screen {
    background-color: rgb(240 248 208); /*#dbffa4;*/ /*#f0ffd8*/
    transition: opacity 2s;
    height: 100%;
    aspect-ratio: 160 / 144;
    z-index: 2;
    mix-blend-mode: color;
  }
  #off-screen.invis {
    opacity: 0;
  }
</style>
<div id="container">
  <div id="off-screen"></div>
  <two-bit-drawing id="static-drawing" width="160" height="144"></two-bit-drawing>
  <two-bit-drawing hidden id="moving-drawing" width="160" height="144"></two-bit-drawing>
</div>
`;

const kDing = 'data:audio/mpeg;base64,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////1LQMx0AhBoLAUDFybAaoYmBLnnZ/1t/////1GJHDwFlIGBB2Br4LBZkcROmyL///////0gWBR9Y+QAJmalgC70frMSIldRNGBVN0JBUqKGdOhbYCZC0kyU//+6BkzYAUbHrOe4itOFrMCc880acSYes17o62oW0wJj0zTpyN7TjU3dSMAQ+cmq07u7Yz+P/61GZPA0qXG3+3////+v9AfZUAWuFbILb/v/////+tysJ6AtsrHf///oqZaIiYAAF9AAAHk69oFnuZ3IJhqNTkjfiJwA8bSIvhK4Ya2pgW7ABQzcsDF0NQDrmQgDCuAcMwNIdpWNXadueetkzxmYLP0TA8lWhdS6Cjbr+tJEiwGGMBQGF9jIDQFRkidNkUv////9v1qWcLItQIBOBQFgZabAHQwoA0CRHw4SeNUv/////91JmBNiEgLAYFAcBgQ7AcyNYCgMFxk4boJt/Sv//1//7SZAaGjKE8AANDxCgD9oAAHQGyM7SirDTNycHPAlNKi769SRuYGbGRsjZSVVklWda2SfX/6jMdAsAGEwBQKfZ///////+tQ1SAgEDAWnFVL///////6Z48JGAweNzP//+nSzMrA8CAAfgaA/PDeufref/l3B/2sQ/hK38Z2wxCWYCAMYOiKY8dUZZvQYcB+YIgUWhQBLFcqM5YpN+uipI8paqkHMnpMYo0P/RSJ0DDYAMDHo0wBQCQzJPGqSP////+392PlUdwAgBAwuEwMXewDSYyBuEUEOaXi6l//////6SJeFyg4DgYdAAGE1gBvU3gDBISiOcTJeR3qQb///V/b9b/+7Bk1QGVeXrK+1as6FqMCW8AdCsVGe0p7tq3IS4wJXUg1pxHAYVAZsiILt9wD/x/+1e3bRPBD4YRI5bh/LqE1RrohChbM0y/9MwIGG1gYtWo55p//////X/6ZdIuBEQAoLk////////3PERDBoCgELoM/2f/vymncAAJQAB4AAAAE4Qqzv/5cIOPJ0hgx4jggYpAOTAwYDC+iIDjUMwDDYB0AIEwNjoYmEojNE6fWkj/V9H///+iTQEhHAY/UwhbEgxdSRf//////1oJlwc8BAGAKE4GD7kBoQHCkygdUtX//////WpMoDPiijmAYJCoHFQ4CwLGwWzzt//7////0iyAQAluLAAAABgHvQAAK660yuCQ8C2MYZq7K/7VNep1W/f//7mgOGAZaahSRV///////9bHxCwXKT////////UksggFhqVDX1Xf/5JNQAAD0IAOAAFkk6f/rdBYdmm6SG2sNbS8AIEmCQTGTKAn5xigIbH6kB9nbQX//////rOD5BQ0gcM8AEgMRE2RSb//////1qMygOsEgkCIBAY7OQOxggYkTY87f/////+zni2HgAaBIDjGBgogCOSHGKSP//////+cC26o2wDRABD///6H6FDX//58Bn/////////v////////ubCGGlL70ADehQHAAAAAXgWUb/9cohuUZ0kPuRD7kIZmDCwNjzCzlFJ/aYupIvov//////6hFwN7dIi////////6x9EYAkyCjErIv///////6pdFyg6QSLt///////8h2eAAAAAPUABiD///n0cEn//sCSf///9n///+n9AAAPlQBLBYG6v/yt3IVf/7gGT9AaR7est6VqzoRkwJTQKVfw+N6y/odqzgiDApvFA2nMib6MDhhpaVBgYaYErn7h4sBPzLi6bIvopf/////+sSQDiTiSb///////9jYZgELsQBMkf///////oFskgkAAOAmC////////yK8gDADgAAMT///WrsPwoNpf//kmBvqa////////7F8CkicR////////sxmRZatwAAehADwAAAAQ5DlUkP/U4agDJ9SuGGtsMRPMAAIMHRBMmFuP4TyMJQDZZTlwzQTzdD/////+tRmM4AUSwPF1sFgKRI1Sb//////6k0C+QAB4HAaCgGHomBnsDiyC+gn///////WZENGTCyoDA44A2OIQs0OEnjVJv//////5mAwCjdYyoAAAABlqAACKH///1JoJAphWB4v//2BXH////////1OHYgf///5L9zQAPkwHAAJcEjRNL0P8rfSbwp4ca/SS+HAqCiCOM2OkiXelpe//twZOeDguR60Pp7ozgaBTqOCA2mC1HnQ8bujOiusCg80E7URSbSR//////8zFKAcZUQrf///////qH8nQ20KLjz////////TPFoOuAwmK7f///////kjUAaAcAAAB///8zQwCYjpm///UT4A7nv///////845PCqf////////qJav0AAA6DAcAAAABIGqzVX/5Q78HXZQ7bAJW+i0wIADBJMOJAYaArrS0vGqTaSP//////oC4wOmjPP///////+ojSbAceBEeNUm///////9I0IiCQEA4oTqTf///////HusAAAAAog4AAAB///66GkIRvt//+aANn////////UgKHHl////8R1EgAPZAADstKil/rZQl+wTOUP+wxramAJAMwQC4x3WU7oNswOAR45oxMlqzV///////7cGTzgYQvest6fas4JmiabzQNpgtF50Pm7ozgpK/oPHBK1P+pgGgAB1xNEMLqSP//////+mgVxkAbGwFnEDQBDpMkUl///////WozIYQpFwBAQBrQBhvBLnnZ//////1/rCyhlEAAPUAAKxAv//+fZP//rSAkz/////////QCDN////9N/AAAD7QBwAAAATxcqX/9yJ0HZY/bXM6SH0Jg7xOSrTqh2mLqSPRf//////1E2BxQpIv///////+soFcCo4HAH////////Y+Vg1wfmZL////////L/MAAAAA3D4AABA///7oJjwB5DQF4R3///WAWQrN////////MzQLaiB3f///xbtsAAPYwA8xG+cM2V/33XY0PVeGHbhhw00DAYLMLEsnNY0Fm1lxdNkX0Uv/////+ozH/+4Bk5gODAnnQehyjOCXomh8oELUOhesvyPas4HmiavwQNpxcBHgJdv///////1jcLwZbBy0rM////////UuXhWwLVySPP///////8jM8AUgAET///q1KJIVm3//+ozB0c1f///////+dRHAGnN////////zEaLK5AACLMAHAAAAA6iDnGif/qfdhjr4SuGGtww1tHgwGGTJEcPqqIEgGCpSXjFJebN//////qTKAiIHEwkKifb///////1GIrwasAwWfQFCqOIupIv///////QL42BGoQisDF4aGXMFq///////6hPOVvAAAADnAACIAV///6k3ZRP//nAIl////8j////kO7QAA62AMUOXaT/86cOsVyIDJmhPi4AHhwl2A9ioLqRxF0vIpNpN//+mOoDmByXb///////9jMggRUic1f///////qYnRCECSQqpf///////k1xFwAAAB////QFQnOzf//qKIB8kP///7YGT+A6KqedF6GqM6LEiaHzQTtQuN6z/J8ozgozAoPNBS1P/////+oUOPX///+mrKkACsQAHAAAAARG5XRTX+nXDDX283KIbaxK3YZWYAAYYZjcAyxCAxUk/JBidNkcvI//////9MmAbogbXLhBF///////+pMwD8xVAYKI4KIceD7P///////UmYEKPQFAkBk4FjIG6H///////xHrS8AAAAAUAcAAAA///6k9TGIa32//+mRwHgpv////////nWE8ipt////////1m22AAE6oABmuKWPq/9b6LndTOUP+1inhhnYWCDJ7c/BfS2jtMXUkeav//////1GYlIDSBJdv/////7cGTrA4OCesz6fKs4HUU6fwgNpgph50PKAphogyJoHHBO1P///rUL0jQCAgChWIibM////////RJMZIEIOAw2ASDIpf///////Gk8x///qh+h4TAIqU//90BTQO9iaRS////////OrEJA4J3///8SVe0AAA3pAcAAAAEkFJJX/9byporAzez0Vc4UJDmk/KNK6HaYupI9F///////UOEDfpiWf///////+Yk+CAwH2Rf///////62QIGCyYtt///////+WqgAAABRwAAAD////MEAFOd//9REEHGSl////////WmCgIX////////z3///9OSAAE6ogAbQXt//qdtdjf6lb6MrjDtpyAEGmLg+frAQ0KmaxYnTZF9FL//////oE2DeIDUSZGTQ///////+pMcgUuA8rAX/+3Bk9IPjf3rNeh2rOCzL+f80E7UMJes5ye6s4I2iZwCgTtSBBmr///////2clhYQaBkCgKJlJav//////+oZPMwCQAAP//9aHY+Babf//50vgdON9v///////5gVwTwdj////////9SP///////+aIVQAAgQAPgAAAIgLgylq/8TaxD+ErfxrbDETzAACDBMQTGioDn9jjA8LRkAFhWHOTGqXLhsz/ZataqCv//+mgXxmAMWCsD3/6C5omTJFX//////1qWYDrBIFBaUBi0vA6YCBiRNkX//////+tR0fjANUgYIDIEvICgJGkVTZn9uvb////+Yg3YjHAAAAAAUAcAAAA///6mcwGQaWab//+ToGfG3///////+cNhSQmj////////8wON///+X6wAADNsBwAEUF5////twZO4DoqZ50Pm6ozgsbAoNHA21DHXrN8byrOC8vKb40ErU6SNLNQS2J6WFJOmFAYq0HKECOL9S0vIpNpN//////6YnYDVRU////////6ywYA3uDgJs3///////0D5WDuBZSgv///////8zpAgn///9BHBX1///NgA0q////////1KE3Fq////+If///7LJAACbMAHAAAAAupGyk3/rhhnbyblENtYhtrCVZgACQcS50sFo8IK9oFJ41NmzJH//////pkwAcGQNFwQcxav///////dieEoALnMBoCk0il///////1GJExOwC4UAy+CxSxOpIv///////rGtloAAAAAsw4AABA///0P57BE+3//1HgEwtf///////9AVkq////4i////t67ALDWQAOBRCzpLT9/lD7w5nf/7gGTugaRTesn5vatIMawJzygStQqZ50Hm7o6giCJn4KA21CRtyH/YYDQECCBiNWbMrqDQzTF1JHov//////7hjIDVeydS////////QKZIAQQhd6H///////6ZaLQY+Ac+K6H///////5M0gGCAAf//1MP1gYC53t//+TwBkzX////////sOl////9b////1X9vdDctwHAAABA9sE/kyi1JSSO6STsfrTcAMjiDd3MEA6BGk7ETDgaHZcXUkX0Uv//////UIAgYmg////////9RZNRmQoCPP///////9I8REEgICgwnUl////////NqOAAAAP///1sIYCcY/SRf//UdFygJ0KMav///////+tFEt////////+sqf///107gABJAAAAcVCNEkUl/+NuRA+pXDDW3YXOW4MDQjMbhcPWRmHhXWbAxETY1dpil9X////9BMuCkwREoDFWvBEHzRP///////1mQkIrcDBR//twZPmDo3J6zHqdqzgpiJn/KBG1C0XnO8nujOCTIid4cE7UYAaOQ4TZFL//////9akygVimFhAB0NEkLZ52dm/1f///+/UH1aUgOB///1dAmwcs9L//1kwcQWwNR9v///////8yf////////uTBQb///////+aKuZAAC1IBwAAAAOYxnWZf/yuGKfCnjDlxhy1AACKmJeRqLsXBZ1GSLF1JHNkf/////+5qCgNBJwClkUv///////uaDNhAPByjFX///////2LY7ghBgNQGZL////////G/nQAAAADDDgAAAT///mdwuOvt//+4OP////////6////////+7iyGtX9P//py6oAC4YADxi5iYPOpn/4W527MPu0h01VBCAy3BgNYHQBADgCxKHSeLqSOXkf/////+ssAiP/7cGT4grL4ec/6e6OoLawJkzQTtQ696yvJ9qzgs7ymEQA21AwGA1GHhNm///////+sjCTAeFgcCDdv///////rl4TcDh8Vmf///////5IcA////2EFBBpIuapN//5UAWk/////////rf////////uUhAz////////zSqq6AAALQAPAAAAAWBYz5l/+UO3Am5RDbWJW7C5wIBDF5JPRDUaAkvvH2fq//////+oCQNAxkvjRF////////rG4ZB64UGJWZ////////TLRIhnYBwKM1f///////kH5gAAAAF0PAAAAf//+pNAzGIEWMA9Pt//9CcDYof////////3////////2YXiGf///8vdgAAGwgDgAPhgW//1IbpM6R/2cRt2FMwIJAmLGDtQaHaYupI9F///////cQOD/+3Bk6wOjCHrNenurOCtMCf8cDbUMIec3yfKs6Kw85kTQTtRo85dS////////mRcAqPDaUm////////Y1FpBEENX////////MKA////0w/D8npI//9AzLoBsR3t////////zj////////9Eoi2f///ynasAALlgHAAAAADAWx00E//nYv3Im6DA30WmFgEBQSYEN5w0MjQSfmXF02RfRS//////6jodgDYYhbjV////////0ycCA6QdX///////6ncZwCwk0////////naeAAAAf///7BYGG7///WaADwbf///////+r////////6iV////r66wAzXMOAAAAxYVUtw7/O9///v8p4Yl+pXDDW5Q7athgIKYULHUjC4sPpM8M9f/+oYQGfXlV////////1FM8GLQ8bf/////twZOkBovF5zPocqzoxTAnvNAq1CnXnO+bujOCfsCZE0E7U////sfIkFtgGgZeDf///y1wB7BAw///9Sd1G//9wTs9////s////yKrsAAAMlAHAAABA1g8kDdH/+dTPCnfxr9JG2cBcSFuxlFymsPUpeRS6Tf//////G8Bsmxp////////llYjgLjM////////1tL4OFH3f///KgC4AAAA////qCo+m3//1GINqEh////////62////////9RpsgAAAYEpgj9v/8Ke9diDhrklb6K3ggEMFTD9AgWAX6lpeRSbSb//////1ClwOK3Hl////////5iXwSJB9kf///////3LREQgChkxirX/+v/////NgID////QYgmdt//9RfADyR////////9m////////7lgx////ouP/7YGTuAKLgec56XKM4JUwJ0xwNtQrVgT3tgpagXRTpPCA2nHgACUAFwAAAABpAsR2lZX+pK5zdJDbWJW7C5wAEDFKTPEH9+pXcMVL7P//////rQKYNjgGlC0KOz////////TJgd4DxsHuG////////6pqK6DAoVXZ////////JaoAAAAA/AAAeCE///zD0PFQBBCb//rQBMEP////////1f////////Uf7AAAC7UBwAAAgOBCqTxr//W9W5Y77EKeMO+MEhHhNefSuh2mLqSPRf//////5EgNuTN////////8wPiehAj////////3NheB6qH///6eAAAAf///5goOc3//0Cf/7cGTmhqJ5YE76mqM4Iwv5xxwQtQqN5TnKbozgkjAnIKBC1DCKGH////////pHv////////Om3///9FbgAAAliAcAAAADlEiCTf/zpL9yVvoyuIOGrYBQOYcO560IhwqZLDxOl41Sy6l//////5iIUA1oQBGxq////////1j8TABoPBwlNmf///////7mwnoCwPNmf///////5c4cAUAA////0CcGVLf//ZM0J8kQBzlX////////0Uf///////+xiMh////TUAAAFMILgAEZCmv/+vKLeErfxrdJDbWAaCmMOh9Z4qegxMkUu///////plAOjA/oMWxP///////9kiKBChD3Uv///////1sw6wtKT////////mdPAA////oKwKrt//9ZQAvB/////////1f////////P/+2Bk+4CC8nnL+pyrOCgL+k8oDaYJsYE76eqM4JawJ0xQNtQBosqJgIAJkwHAAABFyBpJucnzUNxvxR+7E/DgwCmD8R1iIhqy6HSLF02Ry8j//////rQL4WWAHQkoq///////+tApkQAcGQ+6H///////7mpOhjoX0Lr/2/X/////zlHAAAAH///8uB/C/qVRSR//1mAr4Ors/////////X////////3cdQ40v6f/1111AAABTIABJHDyv/4U9jdJDbsO2yhBOYECBg8aCZcGgS/UtLyKTaTf/////+o4Cso3f///////9RHoiEoOFnn///////+p1lwHDTz3f//+dSABAAD/+3Bk7wHTBXnL+nyrOiqMCaM0E7UKeecz6e6M4IIwJsxwStQOgD////xX//6wpX/////////////////+UqeQAAlhBcAAAAHYwF0G/+FPYzlDtsMlcMMPBgIYvGnsJbSJmsXTJFWi///////UdFeA0IGRAzf///////qKJfAcEgWCRq////////7mwpwzrP///zyAAAAACUDgAAAD///n7IIAC5t///yZAOjf////////W3////////nUpYAAABzAcAAOxljRv//LHKzlZl4hBIJlpyFBixSZS7xBSeLqWXTZa//////0EyKAgAYGsy8IKGKS///////92TPDjBMdB0y1L///////9c2GeCgXPt/1vZ7f/+r//k7y////kATA0MJJzf/+sawB0U9////////51H////////tgZPmDgud5y/j7q6gtjAlTNBS1CgGDMcbyjOB2r+q8EDac//1kt///+qq4iAAIYQPAAAACuCONFrRRX/zwz1K4YcOkhtwBGCzEQzAYSFgVO2jU2RfR//////9BxCIDjLxPqv///////1lAtgmEEaP////////ZEjxkl////////z4AAAA5AADEA////goNgyn//WBnf///8nUQAAEuQPgAAyD0tF3/+eGeFPDDl0kbawFwJhLh7VD4yrEvGKSO///////1DwBtUhLP////////LCh7DTH////////2KItjf///oAAouAAAgP///seA+KoCJGa7f//WTYHAlv////////XN//twZO4Bsqxfy/obqzgny/mPKBS1C/nnKehyrqiVL+XAoFLUR7////01uZAAAJkBwAAAAHpFjKkr/9nRNpbFndKoWKthxBEji/UtLyKTaSP//////pitgNkxM1f///////zIwBqDENS////////vKAtrf///p4AABA////Q0DQLDfNO//+MqBozSv///////9axQg3////9PWFgAbbhwAAGGCkMial7/9M8suEDFyE2OQHRh1g0YALSYNNkXb//kyDYY2////////0zQL8lX////////uUifEAA6OB////Sf//mQHGav////////uM8kuAAACYUDwAAQACcsm//+t4Z0kNtYhtrCJ5mAA3k7D4eitMXUkej//////+MsBoyVX////////UZmokIo7f///////9xvuAABHP/7YGT3AYK3eUv6HKM4F4U57RwNpglNgTHo6ozglqJmfKBK1AAAQH///8gIUTN//+TQCWNm////////qj4QLkAAACIADdBC0ZJf/9ajpwpjWAkDBA9A8osUsRE2NUkei///8iIGGzf///////51YswPO3///////+xZMv///6gAPAAB0cD///7ARCZDG//6gipr////////qjjG2rYAAACEDgAAAADMwFEYM//+ovkwQMuEDD9AIAQFA4Bq8EA23InOGKX//UPQGIUlNJv///////1phrBi////////9joxPX//9WVAAAjgAAMD///9SjwxEv//+pOX////////8EYo////0//7UGT4AIJeYEx6G6QYIuiZYxwUtQftfz/qAhagX6Jo3BBGnDAOAAEAE4AAIARg8mZlo//rMC/lAMjEPCzogoJyRJ4umzbo0nt/+o6JtAJBGyL////////qNxlhxP////iV2j3+gAD0UD///+qh//qQgr////////wpauwAABrAACAAB3Y8K///0jgXUgWQbQuYYp9n//+Zh/////////43VSWn1ZQo4FGCASlp4WaioAAAAAwAAcAAAC2jH4ADHEH////ywAjAAABgQAi8kjX/+2Bk6wOCLWBL+hmbOB2omYoIDbUIEYEvygJ4YHMiaHxwNpz///nBuAjYChCexMv/8KCH////////9P////////p7cqFoh3V07qrkoR1Yzu7FbLdshgIDFR7kAAAAATAAGxjuNf///SHOIifVB9AAABACAK0Saf8pMkOMf////J//////////R0z2SaLuNLFBKAgTBNvYAAATBWQ019RFH4Eibv///0P////////+//JvCj0ri5AKOAgwQGBc6GMwAAAqB3AYJN///qcaBDSdUiCf/////////////////+m5UnRTrO9KOSeYrPakEDZUBOkc8MsSzAAABYHcRQS///9iWIr/+1Bk+wDCSmBK+qClqB+omaoUCrUINRMr6IIYYFMiaAwQCpzs/////////////////+qf03p12O1tlnI0zspZmdnKVJHZ40jAAAgAB2O1v///lwwS//6G//////ladf/////////7WdXKjMe5b8SVClKrmIcoxyrYhxUGIOOziAodQ6gsHRAOiKr4AAMAALsZFv///Mh9lFN7f///16V/ZP+i0f//////trpUyozsRFRDIRHIkzC6xJiWUVD5DjBE4UwoLqYOEETGGGGildLh//tQRPEAIaYpx+pAFaAWwdmPPAIdB+nnGWkAVMhQlKY5MAqkfAABgA3STf///qL6i68n///9v/S3////////t1lv9kWtO5sGqMqKpDEULFiwMxXUvUSpzOO7ihJAEQBnAihAHM2T///+tJTUf/1/tX/o+rS3/p/+n///9/0zrqrsqK5hJkRz1jyIaWY8qcciCZCJIdOJDcxDo4LBqhVpEOLOPjdyxIdHxoJqkRAAAATgziCSaaa7pv//VWvO///p+b/2mp9m7/0p/////eqbOv/7UET3gjE/DsfaQDDgKeHo9EwHHAbp0RqJgFUIx7yjUTAKoaH0Y081ck9pjGsXNVHkZrzzSw6NyBJSRg8XImHsjiMo+DwmoSKOLgBAD///+aif/f879D7a2R//6OlNt9/////7f6WoiamvU89HKGR1WuNCSmsYYOGIxix80eNhw4hk8gSMEgi4sj43NGsKQAFAQEBaYxuZ////////9S///lLMYwYKWqVhI8IqTEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+3BE8AOyE3nFQgAtMkYOyJhEBahHqekVBoBVASK84hUgHqGqqqqqqqpMQU1FMy4xMDCqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//tQZPMD8l94REIgPUJCzziFBAeoQ93HEwEAV8AAAD/AAAAEqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/7EGTdj/AAAH+AAAAIAAAP8AAAAQAAAaQAAAAgAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';

const kStartupLines = `{
  "map":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  "tiles":"AAAAAAAAAAAAAAAAAAAAAAAA//8AAAAAAAD//wAAAAA="
  }`;

const kClearScreen = `{
  "map":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  "tiles":"AAAAAAAAAAAAAAAAAAAAAA=="
}`;

const kLogo = `{
  "map":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAADwAAAAAAAAAAGxoAAAAABAAdGQAAAAARABMAAAAAAAAAAAAFAgkXHB4AEBIAFA0WDRgJAAAAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  "tiles":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB3d3d3d3d3d3d3d3c/Px8fBwd3d3d3f38+PgAAAAAAAD4+f3/n5+fn4ODg4HBwODgcHA4OBwcHB+fn5+f+/nx8d3d3d3d3d3d3dz4+HBwYGDAwYGDAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPj53d3BwPj4HB3d3Pz8eHgAAAAAcHBwcHBx/f39/HBwcHBwcHBwcHBwcHBwcHBwcAAAAAAAAAAAAAAAAAAAAAD4+f393d3d3f39wcH9/Pj52dn9/a2tra2tra2tra2trAAAAAAAAAAAAAAAAAAAAAB8fPz87Ozs7Ozs7Oz8/Hx8YGDw8Pj44ODg4/v7+/jg4ODi4uLi4uLi4uLi4uLg4OHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwf39/f39/AAAAAAAAAAAAAAAAAAAAAHd3d3d3d3d3NjY+PhwcHBxzc3d3d3d3d3d3d3d3d3Nzfn5/f3d3cHBwcHBwcHBwcHBwcHBwcHBwcHD+/v7+cHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOfn9/d3d3d39/cHB/f35+cAAAAAAAAAAAAAAwMDAwAAAAD/////d3d3d3d3d3d3dw=="
  }`;


const kNormalColours = [
  [224, 248, 208],
  [136, 192, 112],
  [52, 104, 86],
  [8, 24, 32],
];

export class StartupScreen extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));

    this.logoDrawing = this.shadowRoot.getElementById('moving-drawing');
    this.staticDrawing = this.shadowRoot.getElementById('static-drawing');
    this.dingSound = new Audio(kDing);
  }

  async start() {
    this.staticDrawing.fromB64JSONGBData(kStartupLines);
    this.shadowRoot.getElementById('off-screen').className = 'invis';
    const onPromise = new Promise((res, rej) => {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        this.staticDrawing.fromB64JSONGBData(kClearScreen);
        res();
      }));
    });
    this.dingSound.currentTime = 0;
    await onPromise;
    this.logoDrawing.hidden = false;
    this.logoDrawing.fromB64JSONGBData(kLogo);
    this.logoDrawing.className = 'down';

    const controller = new AbortController();
    const transitionPromise = new Promise((res, rej) => {
      this.logoDrawing.addEventListener('transitionend',
      () => res(),
      {signal: controller.signal});
    });

    await transitionPromise;
    this.dingSound.play();

    controller.abort();
    
    await new Promise((res, rej) => setTimeout(res, 1000));
    console.log('ok');
  }
}
customElements.define('startup-screen', StartupScreen);