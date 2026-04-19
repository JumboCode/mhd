/** Shape of each row in public/MA_schools_long_lat.csv. */
export type CsvRow = {
    name: string;
    street: string;
    city: string;
    state: string;
    zipcode: string;
    county: string;
    lat: string;
    long: string;
};
