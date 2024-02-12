import { finalize } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { Item } from '../interfaces/item.interface';
import { ItemService } from '../item.service';
import { forkJoin } from 'rxjs';
import * as Tone from 'tone'
import { LocationCode } from './location_code_mapping';
import { ItemUpdate } from '../interfaces/item_update.interface';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})

export class MainComponent implements OnInit, OnDestroy {
  loading = false;
  itemRMSTMatch: boolean = false;
  itemRecord: Item;
  rmstBarcodeForItems: string;
  // Sandbox values 
  // library: string = 'elsc';
  // location: string = '2305open';
  library: string = 'LSC';
  location: string = 'shmoffs';
  libraryDesc: string = 'Offsite Storage';
  locationDesc: string = 'Sheridan Stacks at LSC';
  circDesk: string = 'DEFAULT_CIRC_DESK';

  constructor(
    private alert: AlertService,
    private itemService: ItemService
  ) { }

  ngOnInit() {
  }

  ngOnDestroy(): void {
  }

  playBeep(note: string): void {
    const synth = new Tone.Synth().toDestination();
    synth.triggerAttackRelease(note, "8n");
  }

  checkItem() {
    if(this.itemRecord && this.itemRecord.item_data.storage_location_id === this.rmstBarcodeForItems) {
      this.itemRMSTMatch = true;
      return;
    } else {
      this.playBeep("C3");
      this.alert.error('The RMST barcode does not match the item.');
    }
  }

  onItemEnterPressed(itemBarcode: string, inputElement: HTMLInputElement) {
    this.loading = true;
    inputElement.value = '';
    this.itemService.getItemByBarcode(itemBarcode).pipe(
      finalize(() => this.loading = false)
    ).subscribe(
      item => {
        const uniqueId = item.item_data.barcode;
        this.itemRecord = item;
        this.checkItem();
      },
      error => {
        console.error(error);
        this.playBeep("C3");
        this.alert.error('An error occurred while retrieving this item.');
      }
    )
  }

  onRMSTEnterPressed(rmstBarcode: string) {
    this.rmstBarcodeForItems = rmstBarcode;
    this.checkItem();
  }

  onSubmit() {
    this.loading = true;
    this.checkItem();
  }
  reset(): void {
    this.itemRecord = undefined;
    this.rmstBarcodeForItems = undefined;
  }
}
