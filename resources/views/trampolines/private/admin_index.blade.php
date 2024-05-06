@extends('layouts.admin_panel_layout')
@section('content')
    <div class="row mb-5">
        <div class="col-4">
            <button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#createTrampolineModal">Pridėti
                naują batutą
            </button>
            <button id="refreshTable" class="btn btn-secondary">
                Arnaujinti lentelė
            </button>
        </div>
        <div class="col-2">
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">
                <label class="form-check-label" for="flexSwitchCheckDefault">Aktyvus batutai</label>
            </div>
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">
                <label class="form-check-label" for="flexSwitchCheckDefault">Neaktyvvus batutai</label>
            </div>
        </div>
    </div>
    <div class="row mb-5">
        <div class="col-12">
            <table id="trampolineTable" class="display" style="width:100%">
                <tbody></tbody>
            </table>
        </div>
    </div>
    <div class="modal fade" id="createTrampolineModal" data-bs-backdrop="static" tabindex="-1"
         aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">Batuto sukurimas</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="createTrampolineForm" class="needs-validation" novalidate>
                        <div class="row mb-3">
                            <div class="col-6">
                                <label for="trampolineName" class="form-label">Pavadinimas</label>
                                <input name="trampolineName" type="text" class="form-control" id="trampolineName"
                                       aria-describedby="trampolineName" required>
                                <div class="invalid-feedback trampolineNameInValidFeedback"></div>
                                <div class="valid-feedback">Viskas OK !</div>
                            </div>
                            <div class="col-6">
                                <label for="trampolineColor" class="form-label">Spalva</label>
                                <input name="trampolineColor" type="text" class="form-control" id="trampolineColor"
                                       aria-describedby="trampolineColor">
                                <div class="invalid-feedback trampolineColorInValidFeedback"></div>
                                <div class="valid-feedback">Viskas OK !</div>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-4">
                                <label for="trampolineHeight" class="form-label">Aukštis</label>
                                <div class="input-group">
                                    <input name="trampolineHeight" type="number" class="form-control" required>
                                    <span class="input-group-text">m</span>
                                    <div class="invalid-feedback trampolineHeightInValidFeedback"></div>
                                </div>
                            </div>
                            <div class="col-4">
                                <label for="trampolineLength" class="form-label">Ilgis</label>
                                <div class="input-group">
                                    <input name="trampolineLength" type="number" class="form-control" required>
                                    <span class="input-group-text">m</span>
                                    <div class="invalid-feedback trampolineLengthInValidFeedback"></div>
                                </div>
                            </div>
                            <div class="col-4">
                                <label for="trampolineWidth" class="form-label">Plotis</label>
                                <div class="input-group">
                                    <input name="trampolineWidth" type="number" class="form-control" required>
                                    <span class="input-group-text">m</span>
                                    <div class="invalid-feedback trampolineWidthInValidFeedback"></div>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col">
                                <label for="trampolineDescription" class="form-label">Aprašymas</label>
                                <input type="text" name="trampolineDescription" class="form-control" id="trampolineDescription">
                                <div class="invalid-feedback trampolineDescriptionInValidFeedback"></div>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-5">
                                <label for="trampolinePrice" class="form-label">Kaina</label>
                                <div class="input-group">
                                    <input name="trampolinePrice" type="number" class="form-control">
                                    <span class="input-group-text">€/dieną</span>
                                    <div class="invalid-feedback trampolinePriceInValidFeedback"></div>
                                </div>
                            </div>
                            <div class="col-2"></div>
                            <div class="col-5 mt-4">
                                <div class="form-check">
                                    <input name="trampolineActivity" class="form-check-input" type="checkbox" checked>
                                    <label class="form-check-label" for="trampolineActivity">
                                        Aktyvuoti  batutą
                                    </label>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Uždaryti</button>
                    <button type="submit" class="btn btn-primary createTrampoline">Sukurti</button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="showTrampolineModal" tabindex="-1" aria-labelledby="exampleModalLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">Modal title</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    ...
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary">Save changes</button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="updateTrampolineModal" data-bs-backdrop="static" tabindex="-1"
         aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">Batuto atnaujinimas</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="updateTrampolineForm" class="needs-validation" novalidate>
                        <div class="row mb-3">
                            <div class="col-6">
                                <label for="trampolineName" class="form-label">Pavadinimas</label>
                                <input name="trampolineName" type="text" class="form-control" id="trampolineName"
                                       aria-describedby="trampolineName" required>
                                <div class="invalid-feedback trampolineNameInValidFeedback"></div>
                                <div class="valid-feedback">Viskas OK !</div>
                            </div>
                            <div class="col-6">
                                <label for="trampolineColor" class="form-label">Spalva</label>
                                <input name="trampolineColor" type="text" class="form-control" id="trampolineColor"
                                       aria-describedby="trampolineColor">
                                <div class="invalid-feedback trampolineColorInValidFeedback"></div>
                                <div class="valid-feedback">Viskas OK !</div>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-4">
                                <label for="trampolineHeight" class="form-label">Aukštis</label>
                                <div class="input-group">
                                    <input name="trampolineHeight" type="number" class="form-control" required>
                                    <span class="input-group-text">m</span>
                                    <div class="invalid-feedback trampolineHeightInValidFeedback"></div>
                                </div>
                            </div>
                            <div class="col-4">
                                <label for="trampolineLength" class="form-label">Ilgis</label>
                                <div class="input-group">
                                    <input name="trampolineLength" type="number" class="form-control" required>
                                    <span class="input-group-text">m</span>
                                    <div class="invalid-feedback trampolineLengthInValidFeedback"></div>
                                </div>
                            </div>
                            <div class="col-4">
                                <label for="trampolineWidth" class="form-label">Plotis</label>
                                <div class="input-group">
                                    <input name="trampolineWidth" type="number" class="form-control" required>
                                    <span class="input-group-text">m</span>
                                    <div class="invalid-feedback trampolineWidthInValidFeedback"></div>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col">
                                <label for="trampolineDescription" class="form-label">Aprašymas</label>
                                <input type="text" name="trampolineDescription" class="form-control" id="trampolineDescription">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-5">
                                <label for="trampolinePrice" class="form-label">Kaina</label>
                                <div class="input-group">
                                    <input name="trampolinePrice" type="number" class="form-control">
                                    <span class="input-group-text">€/dieną</span>
                                    <div class="invalid-feedback trampolinePriceInValidFeedback"></div>
                                </div>
                            </div>
                            <div class="col-2"></div>
                            <div class="col-5 mt-4">
                                <div class="form-check">
                                    <input name="trampolineActivity" class="form-check-input" type="checkbox" checked>
                                    <label class="form-check-label" for="trampolineActivity">
                                        Aktyvuoti  batutą
                                    </label>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Uždaryti</button>
                    <button type="submit" class="btn btn-primary updateTrampoline">Atnaujinti</button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="removeTrampolineModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Ištrinimas</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Ar tikrai norite ištrinti batutą?</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Išeiti</button>
                    <button type="submit" class="btn btn-danger removeTrampoline">Ištrinti</button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="showTrampolinePicturesModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Nuotraukos</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="formFileMultiple" class="form-label">Įkelkite nuotraukas</label>
                        <input class="form-control" type="file" id="formFileMultiple" multiple>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Uždaryti</button>
                    <button type="button" class="btn btn-primary">Išsaugoti pakeitimus</button>
                </div>
            </div>
        </div>
    </div>
@endsection
@section('custom_js')
    <script src="/js/trampolines/private/trampolines_admin.js"></script>
@endsection
