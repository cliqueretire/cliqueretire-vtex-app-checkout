;(async function () {
  /* Load Script function we may need to load jQuery from the Google's CDN */
  /* That code is world-reknown. */
  /* One source: http://snipplr.com/view/18756/loadscript/ */
  var loadScript = function (url, callback) {
    var script = document.createElement('script')
    script.type = 'text/javascript'
    // If the browser is Internet Explorer.
    if (script.readyState) {
      script.onreadystatechange = function () {
        if (script.readyState == 'loaded' || script.readyState == 'complete') {
          script.onreadystatechange = null
          callback()
        }
      }
      // For any other browser.
    } else {
      script.onload = function () {
        callback()
      }
    }
    script.src = url
    document.getElementsByTagName('head')[0].appendChild(script)
  }

  const fetchConfig = async () => {
    return await (
      await fetch(`https://services.cliqueretire.com.br/vtex/api/v1/config/read/${window.location.host}`)
    ).json();
  };

  const config = await fetchConfig();

  const carrierName = config && config.payload ? config.payload.shipperTitle : 'Clique Retire';
  const carrierSelector = "label[id='" + carrierName + "'] > input"

  const logisticInfo = () => {
    const orderForm = window.vtexjs.checkout.orderForm
    return orderForm && orderForm.shippingData && orderForm.shippingData.logisticsInfo.length
      ? orderForm.shippingData.logisticsInfo[0].selectedSla
      : null
  }

  const cr_boxCliqueretire = (orderNo, name) => `
        <div class="cr_box-cliqueretire">
          <h4>Receba fora de casa</h4>
          <div class="cr_box-item col-1-2">
      ${
        !orderNo
          ? ` <div class="box-item col-1-2 cr_cliqueretire-image">
          <a href="#" id="cr_buttonOpen" class="btn btn-large btn-success">Escolher local para retirada</a>
          </div>`
          : `<p>Você escolheu o e-box ${orderNo}​ - ${name}​</p> 
        <button id="cr_cleanerLocker">Limpar</button>
        </div>
        <div class="box-item col-1-2 cr_cliqueretire-image">
          <a href="#" id="cr_buttonOpen" class="btn btn-large btn-success">Alterar local para retirada</a>
        </div>
        `
      }​
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
          </div>
          <div class="clearfix"></div>
        </div>`

  const cr_dialogTemplate = `<div
        id="cr_dialog">
         <div style="display: flex; justify-content: space-between;">
         <span id="cr_textDialog">Clique Retire</span>
         <button
         id="cr_closeIframe">x</button>
         </div>
                <iframe
                id="cr_iframe"
                frameborder="0"
                marginheight="0" allowfullscreen></iframe>
            </div>`

  const UpdateCliqueRetire = (renderLayout, newOrderNo, newName) => {
    const selectSla = logisticInfo()

    if (window.location.hash == '#/payment' || window.location.hash == '#/shipping') $('#cr_trButton').remove()
    if (
      $('.shipping-container').length &&
      !$('#cr_trButton').length &&
      ($(carrierSelector).is(':checked') === true || selectSla === carrierName)
    )
      renderLayout(newOrderNo, newName)
  }

  const setItemToStorage = (data) => {
    if (data) {
      const { name, orderNo, userPostalCode, address } = data
      window.localStorage.setItem(
        'cr_selectedLocker',
        JSON.stringify({
          name,
          orderNo,
          userPostalCode,
          address,
        })
      )
    } else {
      window.localStorage.setItem(
        'cr_selectedLocker',
        JSON.stringify({
          name: null,
          orderNo: null,
          userPostalCode: null,
          address: null,
        })
      )
    }
  }

  const AddressInfo = (Address, locker) => {
    return !Address
      ? null
      : {
          name:
            Address.complement && Address.complement.startsWith('CR0')
              ? Address.complement.replace(Address.complement.split(' ')[0], '')
              : null,
          orderNo: Address.complement && Address.complement.startsWith('CR0') ? Address.complement.split(' ')[0] : null,
          userPostalCode:
            (Address.complement && !Address.complement.startsWith('CR0')) || !Address.complement
              ? Address.postalCode
              : locker
              ? locker.userPostalCode
              : null,
          address: {
            neighborhood: Address.neighborhood,
            postalCode: Address.postalCode,
            city: Address.city,
            state: Address.state,
            street: Address.street,
            complement: Address.complement,
            number: Address.number || 'S/N',
            country: 'BRA',
            addressType: 'residential',
          },
        }
  }


  const CRCheckout = async ($) => {
    let srcModal = ''
    let locker = JSON.parse(window.localStorage.getItem('cr_selectedLocker'));


    function renderLayout(orderNo, name) {
      $("label[id='" + carrierName + "']").after(`<div id="cr_trButton"></div>`)
      $(`#cr_trButton`).append(cr_boxCliqueretire(orderNo, name))

      $('#cr_InfoOpen').click(function (e) {
        e.preventDefault()
        srcModal = '/cliqueretire/information'
        !$('#cr_dialog').dialog('isOpen') ? $('#cr_dialog').dialog('open') : $('#cr_dialog').dialog('close')
      })

      $('#cr_buttonOpen').click(function (e) {
        e.preventDefault()
        srcModal = '/cliqueretire/map'
        !$('#cr_dialog').dialog('isOpen') ? $('#cr_dialog').dialog('open') : $('#cr_dialog').dialog('close')
      })

      $(`#cr_cleanerLocker`).click(function (e) {
        e.preventDefault()
        vtexjs.checkout
          .sendAttachment('shippingData', { address: null, availableAddresses: null, logisticsInfo: null })
          .then(() => window.location.reload())
          .fail((e) => console.log(e))
        window.localStorage.removeItem('cr_selectedLocker')
        locker = { userPostalCode: locker.userPostalCode }
      })
    }

    $('html').append(cr_dialogTemplate)
    window.onload = () => {
      const Address = window.vtexjs.checkout.orderForm ? window.vtexjs.checkout.orderForm.shippingData.address : locker
      const FullInfoPayload = AddressInfo(Address, locker)
      const selectSla = logisticInfo()

      if (Address) setItemToStorage(FullInfoPayload)

      var observer = new MutationObserver((mutations) => {
        if (mutations.length && !$('#cr_trButton').length && $('.shipping-data').length)
          mutations.forEach(function () {
            if ($('.shipping-container').length && !$('#cr_trButton').length)
              renderLayout(
                FullInfoPayload ? FullInfoPayload.orderNo : null,
                FullInfoPayload ? FullInfoPayload.name : null
              )
          })
      })

      if (
        ($('.shipping-container').length && !$('#cr_trButton').length && $(carrierSelector).is(':checked') === true) ||
        selectSla === carrierName
      )
        renderLayout(FullInfoPayload ? FullInfoPayload.orderNo : null, FullInfoPayload ? FullInfoPayload.name : null)

      observer.observe(document.body, { childList: true, attributes: true })

      setInterval(() => {
        if (window.location.hash == '#/shipping') {
          const shippingButton = $('#btn-go-to-payment')
          const selected = JSON.parse(window.localStorage.getItem('cr_selectedLocker'));
          const hasSelect = selected && selected.name
            ? selected.name
            : null

            UpdateCliqueRetire(
              renderLayout,
              FullInfoPayload ? FullInfoPayload.orderNo : null,
              FullInfoPayload ? FullInfoPayload.name : null
            )

          hasSelect
            ? $(carrierSelector).is(':checked') === false
              ? window.localStorage.removeItem('cr_selectedLocker')
              : shippingButton.prop('disabled', false)
            : shippingButton.prop('disabled', $(carrierSelector).is(':checked'))
        }
      }, 500)
    }

    $(window).on('deliverySelected.vtex', function () {
      const Address = window.vtexjs.checkout.orderForm ? window.vtexjs.checkout.orderForm.shippingData.address : null
      const FullInfoPayload = AddressInfo(Address, locker)
      if (Address) setItemToStorage(FullInfoPayload)
      UpdateCliqueRetire(
        renderLayout,
        FullInfoPayload ? FullInfoPayload.orderNo : null,
        FullInfoPayload ? FullInfoPayload.name : null
      )
    })

    $(`#cr_dialog`).dialog({
      autoOpen: false,
      closeOnEscape: false,
      draggable: false,
      width: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 400 : 1000,
      resizable: true,
      fluid: true,
      position: {
        my: 'center',
        at: 'center',
        of: window,
      },
      open: function () {
        $(`#cr_dialog`).css('display', 'absolute')
        $(`.step .text input`).css('z-index', '0')
        $(`#cr_textDialog`).text(
          `${
            srcModal === '/cliqueretire/information'
              ? 'Saiba mais Clique Retire'
              : 'Selecione o melhor local para retirada do seu pedido'
          }​`
        )
        $('.payment-data .step').css('z-index', '0')
        $('.cart-fixed.affix, .cart-fixed.affix-bottom').css('z-index', '0')
        $(`#cr_iframe`).attr('src', srcModal)
      },
      close: function () {
        $('#cr_dialog').dialog('close')
      },
    })

    $(`.ui-dialog-titlebar`).css('display', 'none')
    $(`body`).css('max-height', '500px')
    $(`.ui-dialog`).css('margin-top', `100px`)
    $('#cr_closeIframe').click(function () {
      $('#cr_dialog').dialog('close')
    })
  }

  if (typeof jQuery === 'undefined' || parseFloat(jQuery.fn.jquery) < 1.7) {
    loadScript('https://code.jquery.com/ui/1.12.1/jquery-ui.min.js', () => {
      loadScript('//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js', function () {
        jQuery191 = jQuery.noConflict(true);

        if(config && config.payload && config.payload.enable) CRCheckout(jQuery191);
      })
    });
  } else {
    loadScript('https://code.jquery.com/ui/1.12.1/jquery-ui.min.js', () => {
      if(config && config.payload && config.payload.enable) CRCheckout(jQuery)
    })
  }
})()
