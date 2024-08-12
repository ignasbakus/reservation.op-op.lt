let Actions = {
    InitActions: function () {
        ToolTip.init();
        // view.init()
        view.findViewDevice();
        Carousels.trampolinesCarousel.init();
        // Carousels.imageModal.init();
        Carousels.trampolinesCarousel.ChosenTrampoline = firstTrampolineId
        Trampolines.init();
        Trampolines.SendOrder.Events.init();
        Trampolines.Modals.showTrampoline.Events.init();
    }
}
let view = {
    findViewDevice: function () {
        //plansete
        if ($(window).width() >= 768 && $(window).width() <= 1024) {
            console.log('Tablet carousel');
            Trampolines.tabletCarousel = true;
            $('#carousel-wrap').attr('style', 'width: 80%; margin: 0 auto;');
            $('.trampoline-name').show()

            //telefonas
        } else if ($(window).width() < 768) {
            Trampolines.mobileCarousel = true;

            //kompiuteris
        } else if ($(window).width() > 1024) {
            Trampolines.PcCarousel = true;
            $('#carousel-wrap').attr('style', 'width: 50%; margin: 0 auto;');
            $('#sendToOrderDiv').addClass('mb-5')
            $('.trampoline-name').show()
        }
    },
}

let ToolTip = {
    tooltipInstance: null,
    init: function () {
        if (window.innerWidth > 768) {
            this.tooltipInstance = tippy('.carousel-item', {
                content: 'Paspauskite ant batuto, kad pamatytumėte daugiau nuotraukų ir informacijos',
                placement: 'top',
            });
        }
    },
    destroy: function () {
        if (this.tooltipInstance) {
            this.tooltipInstance.forEach(instance => instance.destroy());
            this.tooltipInstance = null;
        }
    }
}

let Carousels = {
    trampolinesCarousel: {
        Carousel: new bootstrap.Carousel('#trampolinesCarousel', {
            keyboard: true,
            touch: true
        }),
        ChosenTrampoline: 0,
        init: function () {
            $('#trampolinesCarousel').on('slide.bs.carousel', event => {
                this.ChosenTrampoline = $(event.relatedTarget).data('trampolineid');
            })
            $('#selectTrampoline').on('click', () => {
                Trampolines.addToSelected(this.ChosenTrampoline);
                $('#selectedTrampolinesSection').show();
                // Change the carousel column to col-lg-6
                if (Trampolines.PcCarousel){
                    $('#selectedTrampolinesSection').attr('style', ' margin: 0 auto;');
                    // $('#carouselColumn').removeClass('col-lg-12').addClass('col-lg-6');
                    // Disable the CSS rule for carousel wrap
                    // $('#carousel-wrap').removeAttr('style');
                }
            })
            $('#trampolinesCarousel .openModal').on('click', function (event) {
                ToolTip.destroy();
                event.preventDefault();

                const trampolineId = $(this).closest('.carousel-item').data('trampolineid');
                console.log('trampolineId:', trampolineId);

                const trampoline = trampolinesFromDb.find(t => t.id === trampolineId);
                console.log('trampoline: ', trampoline)

                if (trampoline) {
                    // Update the modal carousel with images
                    const $modalInner = $('#carouselExample .carousel-inner');
                    $modalInner.empty(); // Clear existing items

                    // Populate carousel items
                    trampoline.image_urls.forEach((url, index) => {
                        const $item = $('<div class="carousel-item"></div>');
                        if (index === 0) $item.addClass('active'); // Set the first item as active

                        const $img = $(`<img src="${url}" class="d-block w-100 modal-image" alt="Trampoline Image">`);
                        $item.append($img);
                        $modalInner.append($item);
                    });
                }
            })
        },
    },
}

let Trampolines = {
    PcCarousel: false,
    mobileCarousel: false,
    tabletCarousel: false,
    init: function () {
    },
    chosen: [],
    Modals: {
        showTrampoline: {
            descriptionChosenTrampoline: '',
            element: new bootstrap.Modal('#showTrampolineModal'),
            Events: {
                init: function () {
                    $('#showTrampolineModal').on('show.bs.modal', (event) => {
                        this.fetchDescription(event);
                    })
                    $('#showTrampolineModal .chooseTrampoline').on('click', (event) => {
                        event.stopPropagation();
                        Trampolines.addToSelected(Carousels.trampolinesCarousel.ChosenTrampoline);
                        Trampolines.Modals.showTrampoline.element.hide();
                        $('#selectedTrampolinesSection').show();
                        if (Trampolines.PcCarousel){
                            $('#selectedTrampolinesSection').attr('style', ' margin: 0 auto;');
                            // $('#carouselColumn').removeClass('col-lg-12').addClass('col-lg-6');
                            // Disable the CSS rule for carousel wrap
                            // $('#carousel-wrap').removeAttr('style');
                        }
                    });
                },
                fetchDescription: function (event) {
                    const button = $(event.relatedTarget).closest('.carousel-item'); // Closest carousel item
                    const trampolineId = button.data('trampolineid'); // Extract info from data-* attributes
                    let trampoline = trampolinesFromDb.find(t => t.id === trampolineId);
                    console.log('trampoline:', trampoline)
                    let modalDescription = Trampolines.Modals.showTrampoline.element._element.querySelector('.modal-description h6');
                    let modalSizes = Trampolines.Modals.showTrampoline.element._element.querySelector('.modal-description .sizes');
                    let modalPrice = Trampolines.Modals.showTrampoline.element._element.querySelector('.modal-description .price');
                    console.log('trampoline description:', trampoline.description)
                    modalDescription.textContent = trampoline.description;
                    modalSizes.innerHTML = 'Ilgis: <span style="font-weight: bold;">' + trampoline.parameter.length + unitOfMeasure +
                        '</span>, Plotis: <span style="font-weight: bold;">' + trampoline.parameter.width + unitOfMeasure +
                        '</span>, Aukštis: <span style="font-weight: bold;">' + trampoline.parameter.height + unitOfMeasure + '</span>';
                    modalPrice.innerHTML = 'Kaina: <span style="font-weight: bold;">' + trampoline.parameter.price +
                        currency + '/' + rentalType + '</span>';
                },
            }
        }
    },
    SendOrder: {
        Events: {
            init: function () {
                $('#sendToOrderButton').on('click', (event) => {
                    window.location.href = '/orders/public?' + $.param({
                        trampoline_id: Trampolines.chosen
                    });
                });
            }
        }
    },
    addToSelected: function (TrampolineID) {
        if (!this.chosen.includes(TrampolineID)) {
            this.chosen.push(TrampolineID);
        }
        this.updateOrderButtonState();
        this.getTrampolinesView();
    },
    removeFromSelected: function (TrampolineID) {
        let index = this.chosen.indexOf(TrampolineID);
        if (index !== -1) {
            this.chosen.splice(index, 1);
        }
        this.updateOrderButtonState();
        this.getTrampolinesView();
    },
    updateOrderButtonState: function () {
        if (this.chosen.length > 0) {
            $('#sendToOrderButton').show();
        } else {
            $('#sendToOrderButton').hide();
        }
    },
    initEventsAfterHtmlUpdate: function () {
        $('.removeSelectedTrampoline').on('click', (event) => {
            event.stopPropagation();
            this.removeFromSelected($(event.currentTarget).data('trampolineid'));
        });
    },
    getTrampolinesView: function () {
        $('#overlay').css('display', 'flex');
        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            method: "POST",
            url: "/trampolines/public/render_selected_view",
            data: {
                chosenTrampolines: Trampolines.chosen
            }
        }).done((response) => {
            $('#overlay').hide();
            $('#SelectedTrampolines').html(response.view);
            this.initEventsAfterHtmlUpdate();
            this.Events.removeSelection()
        }).fail(function (jqXHR, textStatus) {
            alert("Request failed: " + textStatus);
        });
    },
    Events: {
        removeSelection: function () {
            $('.removeSelectedTrampoline').on('click', (event) => {
                event.stopPropagation();
                if (Trampolines.chosen.length === 0) {
                    $('#selectedTrampolinesSection').hide();
                    if (Trampolines.PcCarousel) {
                        $('#carouselColumn').removeClass('col-lg-6').addClass('col-lg-12');
                        $('#carousel-wrap').attr('style', 'width: 50%; margin: 0 auto;');
                    }
                }
            });
        }
    }
};

$(document).ready(function () {
    console.log("/js/trampolines/public/trampolines_public.js -> ready!");
    Actions.InitActions();
    console.log('Trampolines from db: ', trampolinesFromDb)
});
