<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name') }}</title>
    <link href="/frameworks/bootstrap-5.3.3/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
    <link href="/frameworks/bootstrap-icons-1.11.3/font/bootstrap-icons.min.css" rel="stylesheet"
          crossorigin="anonymous">
    <link href="/frameworks/jquery-ui-1.13.2/jquery-ui.min.css" rel="stylesheet" crossorigin="anonymous">
    <link href="https://cdn.datatables.net/v/dt/dt-2.0.5/datatables.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <link href="/css/layout/layout.css" rel="stylesheet" crossorigin="anonymous">
    @yield('custom_css')
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <style>
        .navbar-lightblue {
            background-color: #4E91FD; /* Blue color */
        }

        .navbar-lightblue .navbar-brand,
        .navbar-lightblue .nav-link {
            color: white; /* White text color for contrast */
        }
    </style>
</head>
<body>
<div id="overlay" style="display: none; position: fixed; top: 0; left: 0; height: 100vh; width: 100vw; background: transparent; z-index: 9999; align-items: center; justify-content: center;">
    <div id="spinnerSendOrder" class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"> <!-- Increase size here -->
{{--        <span class="sr-only">Loading...</span>--}}
    </div>
</div>
<div id="page-container">
    <div class="container-fluid">
        <div class="row">
            <div class="col-1 p-0">
                <div class="d-flex flex-column flex-shrink-0 bg-body-tertiary" style="width: 4.5rem;">
                    <ul class="nav nav-pills nav-flush flex-column mb-auto text-center">
                        <li class="nav-item">
                            <a href="{{ route('trampolinesPublic') }}"
                               class="nav-link {{ request()->routeIs('trampolinesPublic') ? 'active' : '' }} py-3 border-bottom rounded-0"
                               data-bs-toggle="tooltip" data-bs-placement="right" aria-label="Home"
                               data-bs-original-title="Home">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                     class="bi bi-house-door"
                                     viewBox="0 0 16 16">
                                    <path
                                        d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z"/>
                                </svg>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="{{ route('adminIndex') }}"
                               class="nav-link {{ request()->routeIs('adminIndex') ? 'active' : '' }} py-3 border-bottom rounded-0"
                               data-bs-toggle="tooltip" data-bs-placement="right" aria-label="Home"
                               data-bs-original-title="Home">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                     class="bi bi-clipboard"
                                     viewBox="0 0 16 16">
                                    <path
                                        d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
                                    <path
                                        d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>
                                </svg>
                            </a>
                        </li>
                        {{--<li>
                            <a href="{{ route('calendarIndex') }}"
                               class="nav-link {{ request()->routeIs('calendarIndex') ? 'active' : '' }} py-3 border-bottom rounded-0"
                               data-bs-toggle="tooltip" data-bs-placement="right" aria-label="Dashboard"
                               data-bs-original-title="Dashboard">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                     class="bi bi-calendar-date"
                                     viewBox="0 0 16 16">
                                    <path
                                        d="M6.445 11.688V6.354h-.633A13 13 0 0 0 4.5 7.16v.695c.375-.257.969-.62 1.258-.777h.012v4.61zm1.188-1.305c.047.64.594 1.406 1.703 1.406 1.258 0 2-1.066 2-2.871 0-1.934-.781-2.668-1.953-2.668-.926 0-1.797.672-1.797 1.809 0 1.16.824 1.77 1.676 1.77.746 0 1.23-.376 1.383-.79h.027c-.004 1.316-.461 2.164-1.305 2.164-.664 0-1.008-.45-1.05-.82zm2.953-2.317c0 .696-.559 1.18-1.184 1.18-.601 0-1.144-.383-1.144-1.2 0-.823.582-1.21 1.168-1.21.633 0 1.16.398 1.16 1.23"/>
                                    <path
                                        d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
                                </svg>
                            </a>
                        </li> --}}
                        <li>
                            <a href="{{ route('orderTableIndex') }}"
                               class="nav-link {{ request()->routeIs('orderTableIndex') ? 'active' : '' }} py-3 border-bottom rounded-0"
                               data-bs-toggle="tooltip" data-bs-placement="right" aria-label="Orders"
                               data-bs-original-title="Orders">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                     class="bi bi-activity"
                                     viewBox="0 0 16 16">
                                    <path fill-rule="evenodd"
                                          d="M6 2a.5.5 0 0 1 .47.33L10 12.036l1.53-4.208A.5.5 0 0 1 12 7.5h3.5a.5.5 0 0 1 0 1h-3.15l-1.88 5.17a.5.5 0 0 1-.94 0L6 3.964 4.47 8.171A.5.5 0 0 1 4 8.5H.5a.5.5 0 0 1 0-1h3.15l1.88-5.17A.5.5 0 0 1 6 2"/>
                                </svg>
                            </a>
                        </li>
                    </ul>
                    <div class="dropdown border-top">
                        <a href="#"
                           class="d-flex align-items-center justify-content-center p-3 link-body-emphasis text-decoration-none dropdown-toggle"
                           data-bs-toggle="dropdown" aria-expanded="false">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                                 class="bi bi-person-circle" viewBox="0 0 16 16">
                                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                <path fill-rule="evenodd"
                                      d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                            </svg>
                        </a>
                        <ul class="dropdown-menu text-small shadow">
                            <li class="px-3 py-2">
                                <strong>{{ Auth::user()->name }}</strong>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <!-- Change Password Link -->
                            <!-- Logout Link -->
                            <li>
                                <a class="dropdown-item" href="{{ route('logout') }}"
                                   onclick="event.preventDefault(); document.getElementById('logout-form').submit();">
                                    Atsijungti
                                </a>
                                <form id="logout-form" action="{{ route('logout') }}" method="POST" class="d-none">
                                    @csrf
                                </form>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-11 mt-5">
                <div id="content-wrap">
                    @yield('content')
                </div>
            </div>
        </div>
    </div>
    <footer id="footer" class="navbar navbar-lightblue">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">Fixed bottom</a>
        </div>
    </footer>
</div>

<script src="/frameworks/jquery-3.7.1.min.js" crossorigin="anonymous"></script>
<script src="/frameworks/jquery-ui-1.13.2/jquery-ui.min.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@popperjs/core@2" crossorigin="anonymous"></script>
<script src="/frameworks/bootstrap-5.3.3/js/bootstrap.bundle.js" crossorigin="anonymous"></script>
<script src="https://cdn.datatables.net/v/dt/dt-2.0.5/datatables.min.js"></script>
@yield('custom_js')

</body>
</html>
