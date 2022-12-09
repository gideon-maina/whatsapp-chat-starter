import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { parsePhoneNumber, CountryCode } from 'libphonenumber-js'
import { TimeZones, TimeZoneCountry } from './timezone-data'

interface Country {
  code: number
  twoLetterISOCode: string
  name: string
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'whatsapp-starter';
  country = new FormControl('');
  phone = new FormControl('');
  countries: Country[] = [];
  prefilledText: string = "This is a test message, you're about to send."
  userCountry: string | null = null;

  ngOnInit(): void {
    // Set the countries array. Get this data from somewhere
    this.countries = [
      {code: 251, twoLetterISOCode: "ET", name: "Ethiopia"}, 
      {code: 254, twoLetterISOCode: "KE", name: "Kenya"}, 
      {code: 255, twoLetterISOCode: "TZ", name: "Tanzania"}, 
      {code: 256, twoLetterISOCode: "UG", name: "Uganda"}, 
      {code: 1, twoLetterISOCode: "US", name: "United States"},
    ]
    this.countries.sort((a: Country, b: Country) => {
      if (a.name.toLowerCase() < b.name.toLowerCase()) {
        return -1;
      } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
        return 1
      }
      return 0;
    });
    // Set default country based on timezone
    const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    for (let tz of TimeZones) {
      if (tz.zone === userTz) {
        this.userCountry = tz.country;
        this.country.setValue(this.userCountry);
        break;
      }
    }
  }

  getSelectedCountry(): Country | undefined {
    let country: Country | undefined = undefined;

    for (let c of this.countries) {
      if (c.name === this.country.value) {
        country = c;
        break;
      }
    }
    return country;
  }

  startChat(): void {
    const country = this.getSelectedCountry()

    if (this.phone.value && country) {
      const fullPhone = parsePhoneNumber(this.phone.value, country.twoLetterISOCode as CountryCode);
      // console.log(fullPhone);
      const url = `https://wa.me/${fullPhone.number.substring(1)}?text=${encodeURIComponent(this.prefilledText)}`;
      console.log(url);
      // open web.whatsapp.com or the app if on phone
      window.open(url, "_blank");
      this.phone.setValue("");
    } else {
      console.log("Data is not valid.")
    }
  }

  cantStartChat(): boolean { 
    if (!this.country.value || !this.phone.value) {
      return true;
    }
    const country = this.getSelectedCountry();

    if (country && country.name === this.country.value) {
      const countryCode: CountryCode = country.twoLetterISOCode as CountryCode;
      try {
        const fullPhone = parsePhoneNumber(this.phone.value, countryCode);
        if (!fullPhone.isValid()) {
          return true;
        }
      } catch (err) {
        console.warn(`Error parsing: ${err}`)
        return true;
      }
    }
    return false;
  }

  async tryPastingNumber() {
    const country = this.getSelectedCountry()
    const permissionName = "clipboard-read" as PermissionName;
    // const permission = await navigator.permissions.query({ name: permissionName });
    // console.log(permission);
    
    // if (permission.state === "denied") {
    //   console.warn("User has not allowed the clipboard permissions.")
    //   return;
    // }

    const text = await navigator.clipboard.readText();
    // if (text && country) {
    //   try {
    //     const fullPhone = parsePhoneNumber(text, country.twoLetterISOCode as CountryCode);
    //     if (fullPhone.isValid()) {
    //       console.log(fullPhone)
    //       this.phone.setValue(fullPhone.number);
    //     }
    //   } catch (err) {
    //     console.warn(`Error parsing: ${err}`)
    //   }
    // }
  }
}
