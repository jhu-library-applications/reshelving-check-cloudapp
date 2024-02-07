import { LocationCode } from "../main/location_code_mapping"
import { Item } from "./item.interface"

export interface ItemUpdate {
    item: Item
    rmstBarcodeForItems: string
    bigMoveMode: boolean, 
    location: string, 
    library: string, 
    libraryDesc: string
    locationDesc:string
}
