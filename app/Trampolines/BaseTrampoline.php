<?php

namespace App\Trampolines;

use App\Interfaces\Trampoline;
use App\Models\Client;
use App\Models\ClientAddress;
use App\Models\Order;
use App\Models\OrdersTrampoline;
use App\Models\Parameter;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Faker\Provider\Base;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class BaseTrampoline implements Trampoline
{

    public $OrderData;

    public function register(BaseTrampolineData $TrampolineData): void
    {
        $Trampoline = \App\Models\Trampoline::create([
            'title' => $TrampolineData->trampolineName,
            'description' => $TrampolineData->trampolineDescription,
        ]);
        Parameter::create([
            'trampolines_id' => $Trampoline->id,
            'color' => $TrampolineData->trampolineColor,
            'height' => $TrampolineData->trampolineHeight,
            'width' => $TrampolineData->trampolineWidth,
            'length' => $TrampolineData->trampolineLength,
            'rental_duration' => $TrampolineData->trampolineRentalDuration,
            'rental_duration_type' => $TrampolineData->trampolineRentalDurationType,
            'activity' => $TrampolineData->trampolineActivity,
            'price' => $TrampolineData->trampolinePrice
        ]);
    }

    public function update(BaseTrampolineData $TrampolineData): void
    {
        $trampoline = \App\Models\Trampoline::updateOrCreate(
            [
                'id' => $TrampolineData->trampolineID
            ],
            [
                'title' => $TrampolineData->trampolineName,
                'description' => $TrampolineData->trampolineDescription,
            ]
        );
        Parameter::updateOrCreate(
            [
                'trampolines_id' => $trampoline->id,
            ],
            [
                'color' => $TrampolineData->trampolineColor,
                'height' => $TrampolineData->trampolineHeight,
                'width' => $TrampolineData->trampolineWidth,
                'length' => $TrampolineData->trampolineLength,
                'rental_duration' => $TrampolineData->trampolineRentalDuration,
                'rental_duration_type' => $TrampolineData->trampolineRentalDurationType,
                'activity' => $TrampolineData->trampolineActivity,
                'price' => $TrampolineData->trampolinePrice
            ]
        );

    }

    public function delete(BaseTrampolineData $TrampolineData): void
    {
        $trampoline = \App\Models\Trampoline::find($TrampolineData->trampolineID);
        $trampoline->Parameter()->delete();
        $trampoline->delete();
    }

    public function read($TrampolineID): Model|Collection|Builder|array|null
    {
        return \App\Models\Trampoline::with('Parameter')->find($TrampolineID);
    }

    public function cancelRent()
    {
        // TODO: Implement cancelRent() method.
    }

    public function makeRentable()
    {
        // TODO: Implement makeRentable() method.
    }

    public function onHold()
    {
        // TODO: Implement onHold() method.
    }

    public function getOccupation(Collection $Trampolines, OccupationTimeFrames $TimeFrame, Order $Order, $FullCalendarFormat = false, Carbon $TargetDate = null): array
    {
        $occupiedDates = [];
        $daysWithEvents = [];

        $Order->load('trampolines');

        if (empty($Order->trampolines) || !isset($Order->trampolines[0])) {
            $rental_start = null;
            $rental_end = null;
        } else {
            $rental_start = $Order->trampolines[0]->rental_start;
            $rental_end = $Order->trampolines[0]->rental_end;
        }

        if (is_null($TargetDate)) {
            switch ($TimeFrame) {
                case OccupationTimeFrames::WEEK:
                    $getOccupationFrom = Carbon::now()->startOfWeek();
                    $getOccupationTill = Carbon::now()->endOfWeek();
                    break;
                case OccupationTimeFrames::MONTH:
                    $getOccupationFrom = Carbon::now()->startOfMonth();
                    $getOccupationTill = Carbon::now()->endOfMonth();
                    break;
                default:
                    return $occupiedDates;
            }
        } else {
            switch ($TimeFrame) {
                case OccupationTimeFrames::WEEK:
                    $getOccupationFrom = $TargetDate->copy()->startOfWeek();
                    $getOccupationTill = $TargetDate->copy()->endOfWeek();
                    break;
                case OccupationTimeFrames::MONTH:
                    $getOccupationFrom = $TargetDate->copy()->startOfMonth();
                    $getOccupationTill = $TargetDate->copy()->endOfMonth();
                    break;
                default:
                    return $occupiedDates;
            }
        }

        $from = $getOccupationFrom->copy();
        $till = $getOccupationTill->copy();

        foreach ($Trampolines as $trampoline) {
            $Query = (new OrdersTrampoline())->newQuery();
            $Query->where('trampolines_id', $trampoline->id);
            $Query->where(function (Builder $builder) use ($getOccupationTill, $getOccupationFrom) {
                $builder->whereBetween('rental_start', [$getOccupationFrom->format('Y-m-d'), $getOccupationTill->format('Y-m-d')]);
                $builder->orWhereBetween('rental_end', [$getOccupationFrom->addDay()->format('Y-m-d'), $getOccupationTill->addDay()->format('Y-m-d')]);
            });
            $occupiedDatesForTrampoline = $Query->get();

            if ($FullCalendarFormat) {
                for ($currentDate = $from->copy(); $currentDate->lte($till); $currentDate->addDay()) {
                    foreach ($occupiedDatesForTrampoline as $reserved) {
                        if ($currentDate->between($reserved->rental_start, $reserved->rental_end) && !$currentDate->equalTo($reserved->rental_end)) {
                            $formattedDate = $currentDate->copy()->format('Y-m-d');
                            if (!in_array($formattedDate, $daysWithEvents) && $reserved->rental_start !== $rental_start && $reserved->rental_end !== $rental_end) {
                                $daysWithEvents[] = $formattedDate;
                            }
                            break;
                        }
                    }
                }
            } else {
                foreach ($occupiedDatesForTrampoline as $reserved) {
                    $occupiedDates[] = $reserved;
                }
            }
        }

        if ($FullCalendarFormat) {
            $dateGroups = $this->splitConsecutiveDatesIntoGroups($daysWithEvents);
            $events = $this->formatGroupsIntoEvents($dateGroups);
            $occupiedDates = array_merge($occupiedDates, $events);
        }

        return $occupiedDates;
    }

    function splitConsecutiveDatesIntoGroups($daysWithEvents): array
    {
        if (empty($daysWithEvents)) {
            return [];
        }

        $dateGroups = [];
        $currentGroup = [$daysWithEvents[0]];

        for ($i = 1; $i < count($daysWithEvents); $i++) {
            $currentDate = strtotime($daysWithEvents[$i]);
            $previousDate = strtotime($daysWithEvents[$i - 1]);

            if ($currentDate - $previousDate == 86400) { // 86400 seconds = 1 day
                $currentGroup[] = $daysWithEvents[$i];
            } else {
                $dateGroups[] = $currentGroup;
                $currentGroup = [$daysWithEvents[$i]];
            }
        }

        $dateGroups[] = $currentGroup;
        return $dateGroups;
    }

    function formatGroupsIntoEvents($dateGroups): array
    {
        $events = [];
        foreach ($dateGroups as $group) {
            $event = (object)[
                'id' => null,
                'start' => date('Y-m-d', strtotime($group[0])),
                'end' => date('Y-m-d', strtotime(end($group) . ' +1 day')),
                'backgroundColor' => 'red',
                'editable' => false,
                'extendedProps' => [
                    'type_custom' => 'occ'
                ]
            ];

            // Add the event to the events array
            $events[] = $event;
        }
        return $events;
    }

//    public function getOccupationDataForTargetDate(Collection $Trampolines): \Illuminate\Http\JsonResponse
//    {
////        Log::info('next month trampolines =>', $Trampolines->toArray());
//        $result = $this->getOccupation($Trampolines, OccupationTimeFrames::MONTH, new Order(), true, Carbon::now()->startOfDay()->addMonth());
//        // Return JSON response
//        return response()->json($result);
//    }

    public function getAvailability(Collection $Trampolines, Carbon $fromDate, $FullCalendarFormat = false, ): array
    {
        $availableDates = [];
        $occupiedDates = $this->getOccupation($Trampolines, OccupationTimeFrames::MONTH, new Order(), false, $fromDate);
        $isDateRangeOccupied = function (Carbon $start, Carbon $end) use ($occupiedDates) {
            foreach ($occupiedDates as $occupiedDate) {
                $occupiedStartDate = Carbon::parse($occupiedDate->rental_start);
                $occupiedEndDate = Carbon::parse($occupiedDate->rental_end);
                if ($start->lt($occupiedEndDate) && $end->gt($occupiedStartDate)) {
                    return true;
                }
            }
            return false;
        };
        $todayStart = Carbon::parse($fromDate)->startOfDay();
        $todayEnd = Carbon::parse($fromDate)->addDay()->startOfDay();
        while ($isDateRangeOccupied($todayStart, $todayEnd)) {
            $todayStart->addDay();
            $todayEnd->addDay();
        }
        if ($FullCalendarFormat) {
            $availableDates[] = (object)[
                'extendedProps' => [
                    'trampolines' => $Trampolines,
                    'type_custom' => 'trampolineEvent'
                ],
                'title' => 'Jūsų užsakymas',
                'start' => $todayStart->format('Y-m-d'),
                'end' => $todayEnd->format('Y-m-d'),
            ];
        } else {
            return [$todayStart->format('Y-m-d')];
        }
        return $availableDates;
    }
}
