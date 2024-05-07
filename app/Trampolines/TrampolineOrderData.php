<?php

namespace App\Trampolines;

class TrampolineOrderData
{
    public string $CustomerName;
    public string $CustomerSurname;
    public string $CustomerEmail;
    public string $CustomerPhone;
    public string $City;
    public string $PostCode;
    public string $Address;
    public array $Trampolines;
    public function __construct()
    {
        //Order form -> client info
        $this->CustomerName = request()->get('customerName','');
        $this->CustomerSurname = request()->get('customerSurname','');
        $this->CustomerEmail = request()->get('customerEmail','');
        $this->CustomerPhone = request()->get('customerPhoneNumber','');

        //order form -> client address
        $this->City = request()->get('customerDeliveryCity','');
        $this->PostCode = request()->get('customerDeliveryPostCode','');
        $this->Address = request()->get('customerDeliveryAddress','');

        //Trampolines -> [{id:xxx,rent_start:YYYY-MM-DD,rent_end:YYYY-MM-DD}]
        $this->Trampolines = request()->get('trampolines',[]);
    }


}
