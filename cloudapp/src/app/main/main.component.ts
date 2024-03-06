import { finalize } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { Item } from '../interfaces/item.interface';
import { ItemService } from '../item.service';
import { forkJoin } from 'rxjs';
import * as Tone from 'tone'
import { LocationCode } from './location_code_mapping';
import { ItemUpdate } from '../interfaces/item_update.interface';
import { set } from 'lodash';

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
    if(this.rmstBarcodeForItems && this.itemRecord && this.itemRecord.item_data.storage_location_id === this.rmstBarcodeForItems) {
      this.itemRMSTMatch = true;
      this.playBeep("C4");
      this.alert.success('The RMST barcode matches the item.');
      return;
    } else if(this.rmstBarcodeForItems && this.itemRecord){
      this.playBeep("C3");
      this.alert.error('The RMST barcode does not match the item.');
    }
    this.loading = false;
  }

  onItemEnterPressed(itemBarcode: string) {
    this.loading = true;
    this.setItemRecord(itemBarcode);
    this.checkItem();
  }

  setItemRecord(itemBarcode: string) {
    this.itemService.getItemByBarcode(itemBarcode).pipe(
      finalize(() => this.loading = false)
    ).subscribe(
      item => {
        const uniqueId = item.item_data.barcode;
        this.itemRecord = item;
      },
      error => {
        console.error(error);
        this.playBeep("C3");
        this.alert.error('An error occurred while retrieving this item.');
      }
    )
  }

  setRMSTBarcodeForItems(rmstBarcode: string) {
    this.rmstBarcodeForItems = rmstBarcode;
  }

  onRMSTEnterPressed(rmstBarcode: string) {
    this.loading = true;
    this.setRMSTBarcodeForItems(rmstBarcode);   
    this.checkItem();
  }

  submit(itemBarcode: string, rmstBarcode: string) {
    this.loading = true;
    this.setItemRecord(itemBarcode);
    this.setRMSTBarcodeForItems(rmstBarcode);
    this.checkItem();
  }

  reset(): void {
    this.itemRecord = undefined;
    this.rmstBarcodeForItems = undefined;
  }
}
