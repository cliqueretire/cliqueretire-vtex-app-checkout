(function () {
	/* Load Script function we may need to load jQuery from the Google's CDN */
	/* That code is world-reknown. */
	/* One source: http://snipplr.com/view/18756/loadscript/ */

	var loadScript = function (url, callback) {
		var script = document.createElement("script");
		script.type = "text/javascript";

		// If the browser is Internet Explorer.
		if (script.readyState) {
			script.onreadystatechange = function () {
				if (script.readyState == "loaded" || script.readyState == "complete") {
					script.onreadystatechange = null;
					callback();
				}
			};
			// For any other browser.
		} else {
			script.onload = function () {
				callback();
			};
		}

		script.src = url;
		document.getElementsByTagName("head")[0].appendChild(script);
	};

	var myAppJavaScript = async function ($) {
		let srcModal = "";
		var locker = JSON.parse(window.localStorage.getItem("selectedLocker"));

		function renderLayout(orderNo) {
				if (!orderNo) {
					$(".shipping-data").append(
						`<div id="trButton"></div>`
					);
	
					$(`#trButton`).append(`
					<div style="display: flex;">
					<button id="InfoOpen" style="border: #ffff 1px solid;
					border-radius: .5vh;
					color: #fff;
					font-size: 12px;
					flex: 1;
					padding: .5vh;
					background-color: darkblue;">Informações</button>
					<button
						id="buttonOpen"
						style="outline: none;
						flex: 3;
						color: white;
						background-color: darkblue;
						border-radius: .5vh;
						border: 1px solid white;
						text-decoration: none;
						text-align: center;
						vertical-align: middle;
						cursor: pointer;
						padding: 8px 15px;
						font-size: 12px;
						white-space: normal;
						cursor: pointer;">
						Receba no e-Box da Clique Retire
				</button></div>
			`);
	
				} else {
					$(".shipping-data").append(
						`<div id="trButton" style="padding: 8px;"></div>`
					);
	
					$(`#trButton`).append(`<div style="border: 1px solid darkblue;  border-radius: .5vh; padding: 1vh;">
					<div style="font-size: 24px; margin-left: 1.5vh; color: darkblue; margin-top: 8px;">Entrega Clique Retire</div>
						
					<div
						style="outline: none;
						color: darkblue;
						border-radius: .5vh;
						text-decoration: none;
						text-align: center;
						vertical-align: middle;
						padding: 8px 15px;
						margin-top: 8px;
						white-space: normal;
						font-size: 14px;">
						Você escolheu o e-box ${orderNo}
				</div>
				<div>
				<div style="display: flex; justify-content: space-between; margin-top: .5vh; margin-bottom: 8px;">
				<button id="InfoOpen" style="border: #ffff 1px solid;
				border-radius: .5vh;
				color: #fff;
				flex: 1;
				padding: .5vh;
				background-color: darkblue;">Informações</button>
				<button id="buttonOpen" style="border: #ffff 1px solid;
				border-radius: .5vh;
				color: #fff;
				flex: 2;
				padding: .5vh;
				background-color: darkblue;">Alterar endereço</button>
				<button id="cleanerLocker" style="border: white  1px solid;
				border-radius: .5vh;
				color: white;
				flex: 1;
				padding: .5vh;
				background-color: darkgrey;">Limpar</button>
				</div></div>
				</div> 
				`);
				};

			$("#InfoOpen").click(function (e) {
				e.preventDefault();
				srcModal = '/information';
				!$("#dialog").dialog("isOpen")
					? $("#dialog").dialog("open")
					: $("#dialog").dialog("close");
			});


			$("#buttonOpen").click(function (e) {
				e.preventDefault();
				srcModal = "/cr"
				!$("#dialog").dialog("isOpen")
					? $("#dialog").dialog("open")
					: $("#dialog").dialog("close");
			});

			$(`#cleanerLocker`).click(function (e) {
				e.preventDefault();
				vtexjs.checkout.sendAttachment('shippingData', { address: null, availableAddresses: null, logisticsInfo: null });
				window.localStorage.removeItem("selectedLocker");
				locker = {};
			});
		}


		$("html").append(`<div 
        id="dialog" 
        style="outline: none;
         background-color: darkblue;
         border-radius: 0.5vh;">
         <div style="display: flex; justify-content: space-between;">
         <span id="textDialog" style="font-weight: 500;
         font-size: 16px;
         color: white;
         margin-top: 17px;
         margin-left: 16px;
     ">Clique Retire</span>
         <button 
         id="closeIframe" 
         style="margin-bottom: 16px;
          font-weight: 500;
          margin-right: 16px;
           background-color: darkblue; border: none; 
           font-size: 28px;
           margin-top: 16px;
           color: white; 
           outline: none;">X</button>
         </div>
                <iframe 
                id="iframe" 
                style="background-color: white;
                width: 100%; 
                outline: none; 
                height: 600px; 
                width: 100%" 
                frameborder="0" 
                marginheight="0" allowfullscreen></iframe>
            </div>`);

		window.onload = () => {
			var observer = new MutationObserver((mutations) => {
				if (mutations.length && !$("#trButton").length && $(".shipping-data").length)
					mutations.forEach(function () {
							if ($(".shipping-container").length && !$("#trButton").length)
								renderLayout(locker ? locker.orderNo : null);
					});
			});


			window.addEventListener("message", (e) => {
				$("#dialog").dialog("close");
				if (e.data.length > 0 && locker) {
					var selectedLocker = JSON.parse(e.data);

					if (selectedLocker.orderNo !== locker.orderNo) {

						locker.orderNo = selectedLocker.orderNo;
						window.localStorage.setItem("selectedLocker", JSON.stringify({
							orderNo: selectedLocker.orderNo,
							zip_code: selectedLocker.location.zip_code
						}));

						window.vtexjs.checkout.sendAttachment('shippingData', {
							address: {
								neighborhood: selectedLocker.name,
								postalCode: selectedLocker.location.zip_code,
								city: selectedLocker.location.city,
								state: selectedLocker.location.state,
								street: selectedLocker.location.street,
								complement: "CliqueRetire",
								number: selectedLocker.orderNo || "S/N",
								country: "BRA",
								addressType: "residential"
							}
						});
					}
				}


			});

			observer.observe(document.body, { childList: true, attributes: true });

		}


		$(window).on('deliverySelected.vtex', function () {
			if(!window.vtexjs.checkout.orderForm.shippingData.address || !locker || window.location.hash === "#/shipping") $("#trButton").remove();

			if ($(".shipping-container").length && window.vtexjs.checkout.orderForm.shippingData.address && !$("#trButton").length){
				renderLayout(window.vtexjs.checkout.orderForm.shippingData.address.number);
				
				window.localStorage.setItem("selectedLocker", JSON.stringify({
					orderNo: window.vtexjs.checkout.orderForm.shippingData.address.number,
					zip_code: window.vtexjs.checkout.orderForm.shippingData.address.postalCode
				}));
			} else {
				if ($(".shipping-container").length && !$("#trButton").length)
					renderLayout(null);
			}
		})

		$(`#dialog`).dialog({
			autoOpen: false,
			closeOnEscape: false,
			draggable: false,
			width: 1000,
			fluid: true,
			position: {
				my: "center",
				at: "center",
				of: window,
			},

			open: function () {
				$(`#dialog`).css("display", "absolute");
				$(`.step .text input`).css("z-index", "0")
				$(`#textDialog`).text(`${srcModal === "/information" ? "Saiba mais Clique Retire" : "Selecione o seu endereço de entrega Clique Retire"}`)
				$(".payment-data .step").css("z-index", "0");
				$(".cart-fixed.affix, .cart-fixed.affix-bottom").css("z-index", "0");
				$(`#iframe`).attr(
					"src",
					srcModal
				);
			},
			close: function () {
				$("#dialog").dialog("close");
			},
		});

		$(`.ui-dialog-titlebar`).css("display", "none");

		$(`body`).css("max-height", "500px");

		$(`.ui-dialog`).css("margin-top", `100px`);

		$("#closeIframe").click(function () {
			$("#dialog").dialog("close");
		});
	}

	if (typeof jQuery === "undefined" || parseFloat(jQuery.fn.jquery) < 1.7) {
		loadScript("https://code.jquery.com/ui/1.12.1/jquery-ui.min.js", () => {
			loadScript(
				"//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js",
				function () {
					jQuery191 = jQuery.noConflict(true);
					myAppJavaScript(jQuery191);
				}
			);
		});
	} else {
		loadScript("https://code.jquery.com/ui/1.12.1/jquery-ui.min.js", () => {
			myAppJavaScript(jQuery);
		});
	}
})();