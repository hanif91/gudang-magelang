const formatBulanIndonesia = (date: Date) => {
    const bulan = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${bulan[date.getMonth()]} ${date.getFullYear()}`;
};
export default formatBulanIndonesia;