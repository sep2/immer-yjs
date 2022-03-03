// Copied from https://opensource.adobe.com/Spry/samples/data_region/JSONDataSetSample.html

const data1 = {
    id: '0001',
    type: 'donut',
    name: 'Cake',
    ppu: 0.55,
    batters: {
        batter: [
            { id: '1001', type: 'Regular' },
            { id: '1002', type: 'Chocolate' },
            { id: '1003', type: 'Blueberry' },
            { id: '1004', type: "Devil's Food" },
        ],
    },
    topping: [
        { id: '5001', type: 'None' },
        { id: '5002', type: 'Glazed' },
        { id: '5005', type: 'Sugar' },
        { id: '5007', type: 'Powdered Sugar' },
        { id: '5006', type: 'Chocolate with Sprinkles' },
        { id: '5003', type: 'Chocolate' },
        { id: '5004', type: 'Maple' },
    ],
}

const data2 = {
    id: '0002',
    type: 'donut',
    name: 'Raised',
    ppu: 0.55,
    batters: {
        batter: [{ id: '1001', type: 'Regular' }],
    },
    topping: [
        { id: '5001', type: 'None' },
        { id: '5002', type: 'Glazed' },
        { id: '5005', type: 'Sugar' },
        { id: '5003', type: 'Chocolate' },
        { id: '5004', type: 'Maple' },
    ],
}

const data3 = {
    id: '0003',
    type: 'donut',
    name: 'Old Fashioned',
    ppu: 0.55,
    batters: {
        batter: [
            { id: '1001', type: 'Regular' },
            { id: '1002', type: 'Chocolate' },
        ],
    },
    topping: [
        { id: '5001', type: 'None' },
        { id: '5002', type: 'Glazed' },
        { id: '5003', type: 'Chocolate' },
        { id: '5004', type: 'Maple' },
    ],
}

const sampleArray = [data1, data2, data3]

const sampleObject = {
    [data1.id]: data1,
    [data2.id]: data2,
    [data3.id]: data3,
}

function deepClone(x: any) {
    return JSON.parse(JSON.stringify(x))
}

export type SampleArray = typeof sampleArray
export type SampleObject = typeof sampleObject

export function createSampleArray(): SampleArray {
    return deepClone(sampleArray)
}

export function createSampleObject(): SampleObject {
    return deepClone(sampleObject)
}
