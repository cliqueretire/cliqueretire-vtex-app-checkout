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

		function renderLayout(orderNo, name) {
				if (!orderNo) {
					$(".shipping-data").append(
						`<div id="trButton"></div>`
					);

          $(`#trButton`).append(`
          <div class="box-cliqueretire">
            <h4>Receba fora de casa</h4>
            <div class="box-item col-1-2 cliqueretire-image">
                <a href="#" id="buttonOpen" class=" btn btn-large btn-success" style="margin-top:20px;margin-bottom:20px;">Escolher local para retirada</a>
            </div>
            <div class="box-item col-1-2">
              <div class="content">
                <div class="inner-content">
                  <p>Você não precisa ter alguem em casa para receber.</p>
                  <p>Utilize um e-Box da Clique Retire para retirar sua compra.</p>
                  <p>
                    <a href="#" id="InfoOpen" class="click-como-funciona"> Como Funciona </a>
                  </p>
                  </div>
                <div class="box-tag">Recomendado</div>
              </div>
            </div>
            <div class="clearfix"></div>
          </div>`);

				} else {
					$(".shipping-data").append(
						`<div id="trButton"></div>`
					);

          $(`#trButton`).append(`
          <div class="box-cliqueretire">
            <h4>Receba fora de casa</h4>
            <div class="box-item col-1-1">
						<p>Você escolheu o e-box ${orderNo} - ${name}</p>
            <button id="cleanerLocker" style="border: white  1px solid;
            border-radius: .5vh;
            color: white;
            flex: 1;
            padding: .5vh;
            background-color: darkgrey;">Limpar</button>
            </div>
            <div class="box-item col-1-2 cliqueretire-image">
                <a href="#" id="buttonOpen" class=" btn btn-large btn-success" style="margin-top:20px;margin-bottom:20px;">Alterar local para retirada</a>
            </div>
            <div class="box-item col-1-2">
              <div class="content">
                <div class="inner-content">
                  <p>Você não precisa ter alguem em casa para receber.</p>
                  <p>Utilize um e-Box da Clique Retire para retirar sua compra.</p>
                  <p>
                    <a href="#" id="InfoOpen" class="click-como-funciona"> Como Funciona </a>
                  </p>
                  </div>
                <div class="box-tag">Recomendado</div>
              </div>
            </div>
            <div class="clearfix"></div>
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
         background-color: #0e3cdc;
         border: 1px solid #ccc;
         border-radius: 0.5vh;z-index:9999;">
         <div style="display: flex; justify-content: space-between;">
         <span id="textDialog" style="font-weight: 400;
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
           background-color: #0e3cdc; border: none;
           font-size: 28px;
           margin-top: 16px;
           color: white;
           outline: none;">x</button>
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
								renderLayout(locker ? locker.orderNo : null, locker ? locker.name : null);
					});
			});


			window.addEventListener("message", (e) => {
				$("#dialog").dialog("close");
				if (e.data.length > 0 && locker) {
					var selectedLocker = JSON.parse(e.data);

					if (selectedLocker.orderNo !== locker.orderNo) {

            locker.orderNo = selectedLocker.orderNo;
            locker.name = selectedLocker.name;
						window.localStorage.setItem("selectedLocker", JSON.stringify({
              name: selectedLocker.name,
							orderNo: selectedLocker.orderNo,
							zip_code: selectedLocker.location.zip_code
						}));

						// window.vtexjs.checkout.sendAttachment('shippingData', {
						// 	address: {
						// 		neighborhood: selectedLocker.location.neighborhood,
						// 		postalCode: selectedLocker.location.zip_code,
						// 		city: selectedLocker.location.city,
						// 		state: selectedLocker.location.state,
						// 		street: selectedLocker.location.street,
						// 		complement: "CliqueRetire",
						// 		number: selectedLocker.orderNo || "S/N",
						// 		country: "BRA",
						// 		addressType: "residential"
						// 	}
						// });
					}
				}


			});

			observer.observe(document.body, { childList: true, attributes: true });

		}


		$(window).on('deliverySelected.vtex', function () {
			if ($(".shipping-container").length && window.vtexjs.checkout.orderForm.shippingData.address && !$("#trButton").length){
				renderLayout(window.vtexjs.checkout.orderForm.shippingData.address.complement.split(" ")[0],window.vtexjs.checkout.orderForm.shippingData.address.complement.replace(window.vtexjs.checkout.orderForm.shippingData.address.complement.split(" ")[0],""));

				window.localStorage.setItem("selectedLocker", JSON.stringify({
          name: window.vtexjs.checkout.orderForm.shippingData.address.complement.replace(window.vtexjs.checkout.orderForm.shippingData.address.complement.split(" ")[0],""),
					orderNo: window.vtexjs.checkout.orderForm.shippingData.address.complement.split(" ")[0],
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
				$(`#textDialog`).text(`${srcModal === "/information" ? "Saiba mais Clique Retire" : "Selecione o melhor local para retirada do seu pedido"}`)
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
