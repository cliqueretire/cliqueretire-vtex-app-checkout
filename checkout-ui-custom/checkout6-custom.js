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
		
		const UpdateCliqueRetire = (locker, renderLayout, newName, newOrderNo) => {
			if ((window.location.hash == "#/payment" || window.location.hash == "#/shipping") && locker && !locker.name) $("#cr_trButton").remove();

			if ($(".shipping-container").length && !$("#cr_trButton").length)
				renderLayout(newOrderNo, newName);
		}

		const setItemToStorage = (data) => {

			const { name, orderNo, userPostalCode, address } = data;

			window.localStorage.setItem("cr_selectedLocker", JSON.stringify({
				name,
				orderNo,
				userPostalCode,
				address,
			}));
		};

		const AddressInfo = (Address, locker) => {
			return !Address ? null : (Address.complement && Address.complement.startsWith("CR0"))
				? {
					name: Address.complement.replace(Address.complement.split(" ")[0], ""),
					orderNo: Address.complement.split(" ")[0],
					userPostalCode: ((Address.complement && !Address.complement.startsWith("CR0")) || !Address.complement) ? Address.postalCode : locker ? locker.userPostalCode : null,
					address: {
						neighborhood: Address.neighborhood,
						postalCode: Address.postalCode,
						city: Address.city,
						state: Address.state,
						street: Address.street,
						complement: Address.complement,
						number: Address.number || "S/N",
						country: "BRA",
						addressType: "residential"
					}
				} : {
					name: null,
					orderNo: null,
					address: {
						neighborhood: Address.neighborhood,
						postalCode: Address.postalCode,
						city: Address.city,
						state: Address.state,
						street: Address.street,
						complement: Address.complement,
						number: Address.number || "S/N",
						country: "BRA",
						addressType: "residential"
					}
				}
		}

		var locker = JSON.parse(window.localStorage.getItem("cr_selectedLocker"));

		function renderLayout(orderNo, name) {
			$(".shipping-data").append(
				`<div id="cr_trButton"></div>`
			);

			if (!orderNo) {

				$(`#cr_trButton`).append(`
          <div class="cr_box-cliqueretire">
            <h4>Receba fora de casa</h4>
            <div class="cr_box-item col-1-2 cliqueretire-image">
                <a href="#" id="cr_buttonOpen" class=" btn btn-large btn-success" style="margin-top:20px;margin-bottom:20px;">Escolher local para retirada</a>
            </div>
            <div class="box-item col-1-2">
              <div class="content">
                <div class="inner-content">
                  <p>Você não precisa ter alguem em casa para receber.</p>
                  <p>Utilize um e-Box da Clique Retire para retirar sua compra.</p>
                  <p>
                    <a href="#" id="cr_InfoOpen" class="click-como-funciona"> Como Funciona </a>
                  </p>
                  </div>
                <div class="cr_box-tag">Recomendado</div>
              </div>
            </div>
            <div class="clearfix"></div>
          </div>`);

			} else {

				$(`#cr_trButton`).append(`
          <div class="cr_box-cliqueretire">
            <h4>Receba fora de casa</h4>
            <div class="cr_box-item col-1-1">
						<p>Você escolheu o e-box ${orderNo} - ${name}</p>
            <button id="cleanerLocker" style="border: white  1px solid;
            border-radius: .5vh;
            color: white;
            flex: 1;
            padding: .5vh;
            background-color: darkgrey;">Limpar</button>
            </div>
            <div class="box-item col-1-2 cr_cliqueretire-image">
                <a href="#" id="cr_buttonOpen" class="btn btn-large btn-success" style="margin-top:20px;margin-bottom:20px;">Alterar local para retirada</a>
            </div>
            <div class="box-item col-1-2">
              <div class="content">
                <div class="inner-content">
                  <p>Você não precisa ter alguem em casa para receber.</p>
                  <p>Utilize um e-Box da Clique Retire para retirar sua compra.</p>
                  <p>
                    <a href="#" id="cr_InfoOpen" class="click-como-funciona"> Como Funciona </a>
                  </p>
                  </div>
                <div class="cr_box-tag">Recomendado</div>
              </div>
            </div>
            <div class="clearfix"></div>
          </div>
				`);
			};

			$("#cr_InfoOpen").click(function (e) {
				e.preventDefault();
				srcModal = '/cliqueretire/information';
				!$("#cr_dialog").dialog("isOpen")
					? $("#cr_dialog").dialog("open")
					: $("#cr_dialog").dialog("close");
			});


			$("#cr_buttonOpen").click(function (e) {
				e.preventDefault();
				srcModal = "/cliqueretire/map"
				!$("#dialog").dialog("isOpen")
					? $("#dialog").dialog("open")
					: $("#dialog").dialog("close");
			});

			$(`#cr_cleanerLocker`).click(function (e) {
				e.preventDefault();
				vtexjs.checkout.sendAttachment('shippingData', { address: null, availableAddresses: null, logisticsInfo: null }).then(() => window.location.reload()).fail(e => console.log(e))
				window.localStorage.removeItem("selectedLocker");

				locker = { userPostalCode: locker.userPostalCode };
			});
		}


		$("html").append(`<div
        id="cr_dialog"
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
         id="cr_closeIframe"
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
                id="cr_iframe"
                style="background-color: white;
                width: 100%;
                outline: none;
                height: 600px;
                width: 100%"
                frameborder="0"
                marginheight="0" allowfullscreen></iframe>
            </div>`);

		window.onload = () => {
			const Address = window.vtexjs.checkout.orderForm ? window.vtexjs.checkout.orderForm.shippingData.address : null;

			setItemToStorage(AddressInfo(Address, locker));

			var observer = new MutationObserver((mutations) => {
				if (mutations.length && !$("#cr_trButton").length && $(".shipping-data").length)
					mutations.forEach(function () {
						if ($(".shipping-container").length && !$("#cr_trButton").length)
							renderLayout(locker ? locker.orderNo : null, locker ? locker.name : null);
					});
			});

			if ($(".shipping-container").length && !$("#cr_trButton").length)
				renderLayout(locker ? locker.orderNo : null, locker ? locker.name : null);

			observer.observe(document.body, { childList: true, attributes: true });
		}


		$(window).on('deliverySelected.vtex', function () {
			const Address = window.vtexjs.checkout.orderForm ? window.vtexjs.checkout.orderForm.shippingData.address : null;
			
			Address && setItemToStorage(AddressInfo(Address, locker));

			UpdateCliqueRetire(locker, renderLayout, AddressInfo(Address, locker).orderNo, AddressInfo(Address, locker).name)
		})

		$(`#cr_dialog`).dialog({
			autoOpen: false,
			closeOnEscape: false,
			draggable: false,
			width: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 400 : 1000,
			resizable: true,
			fluid: true,
			position: {
				my: "center",
				at: "center",
				of: window,
			},

			open: function () {
				$(`#cr_dialog`).css("display", "absolute");
				$(`.step .text input`).css("z-index", "0")
				$(`#cr_textDialog`).text(`${srcModal === "/cliqueretire/information" ? "Saiba mais Clique Retire" : "Selecione o melhor local para retirada do seu pedido"}`)
				$(".payment-data .step").css("z-index", "0");
				$(".cart-fixed.affix, .cart-fixed.affix-bottom").css("z-index", "0");
				$(`#cr_iframe`).attr(
					"src",
					srcModal
				);
			},
			close: function () {
				$("#cr_dialog").dialog("close");
			},
		});

		$(`.ui-dialog-titlebar`).css("display", "none");

		$(`body`).css("max-height", "500px");

		$(`.ui-dialog`).css("margin-top", `100px`);

		$("#cr_closeIframe").click(function () {
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
