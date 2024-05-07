<?php

namespace App\Interfaces;

use App\Trampolines\BaseTrampolineData;
use App\Trampolines\OccupationTimeFrames;
use App\Trampolines\TrampolineOrderData;
use Illuminate\Database\Eloquent\Collection;

interface Trampoline
{
    public function register(BaseTrampolineData $TrampolineData);

    public function update(BaseTrampolineData $TrampolineData);

    public function delete(BaseTrampolineData $TrampolineData);

    public function read($TrampolineID);

    public function rent(TrampolineOrderData $trampolineOrderData);

    public function cancelRent();

    public function makeRentable();

    public function onHold();

    public function getOccupation(Collection $Trampolines,OccupationTimeFrames $TimeFrame, $FullCalendarFormat = false);
}
