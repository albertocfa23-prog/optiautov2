import React, { useState, useEffect } from 'react';
import PocketBase from 'pocketbase';

// --- PocketBase Configuration ---
const pb = new PocketBase('http://127.0.0.1:8090');
pb.autoCancellation(false);

// --- SVG Icons (tu código de iconos no cambia) ---
const CarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const DocumentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 1a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6a1 1 0 00-1-1H6z" clipRule="evenodd" /></svg>;
const WrenchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0L8 5.15c-.5.2-1 .5-1.4.85l-1.9-1.05c-1.45-.8-3.17.54-2.37 2l1.05 1.9c-.35.4-.65.9-.85 1.4L3.17 11.5c-1.56.38-1.56 2.6 0 2.98l1.98.49c.2.5.5 1 .85 1.4l-1.05 1.9c-.8 1.45.92 3.17 2.37 2.37l1.9-1.05c.4.35.9.65 1.4.85l.49 1.98c.38 1.56 2.6 1.56 2.98 0l.49-1.98c.5-.2 1-.5 1.4-.85l1.9 1.05c1.45.8 3.17-.54 2.37-2l-1.05-1.9c.35-.4.65-.9.85-1.4l1.98-.49c1.56-.38-1.56-2.6 0-2.98l-1.98-.49c-.2-.5-.5-1-.85-1.4l1.05-1.9c.8-1.45-.92-3.17-2.37-2.37l-1.9 1.05c-.4-.35-.9-.65-1.4-.85L11.49 3.17zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8a4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 3.414 6.293 6.707z" clipRule="evenodd" /></svg>;

// --- El resto de tus componentes (VehicleSearch, AddVehicleForm, VehicleCard, etc.) va aquí ---
// --- No he modificado nada de la parte de Vehículos, así que puedes mantenerla como está ---
// --- ... (Pega aquí todo el código desde fetchSmartcartApi hasta el final de VehicleCard) ---
const fetchSmartcartApi = async (registrationNumber) => {
    if (!registrationNumber) return [];

    console.log(`Realizando llamada a la API de RegCheck para la matrícula: ${registrationNumber}`);
    
    const username = "TU_USERNAME"; 
    const url = "https://www.regcheck.org.uk/api/reg.asmx/CheckSpain";

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
          registrationNumber,
          username
      }).toString()
    };
    
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const xmlText = await response.text(); 
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");

        const carMakeNode = xmlDoc.querySelector("CarMake CurrentTextValue");
        const carModelNode = xmlDoc.querySelector("CarModel");
        const registrationYearNode = xmlDoc.querySelector("RegistrationYear");

        if (carMakeNode && carModelNode) {
            const make = carMakeNode.textContent;
            const model = carModelNode.textContent;
            const year = registrationYearNode ? parseInt(registrationYearNode.textContent, 10) : null;
            
            return [{
                make: make,
                model: model,
                year: year,
                description: "Datos obtenidos de la matrícula."
            }];
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error al obtener la información de la matrícula:", error);
        throw error;
    }
};

// --- Component to search for a vehicle using the Smartcart API ---
const VehicleSearch = ({ onSelectVehicle }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (searchTerm.trim() === '') {
            setError('Por favor, introduce una matrícula.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const results = await fetchSmartcartApi(searchTerm);
            setSearchResults(results);
        } catch (err) {
            setError('Error al buscar el vehículo. Por favor, asegúrate de que la matrícula es correcta e intenta de nuevo.');
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDemoVehicle = () => {
        const demoVehicle = {
            make: "SEAT",
            model: "LEON",
            year: 2021,
            description: "Vehículo de demostración"
        };
        onSelectVehicle(demoVehicle);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Buscar Vehículo por Matrícula</h2>
            <div className="flex items-center space-x-2">
                <input 
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                    placeholder="Ej: 1234ABC"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                />
                <button 
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 flex items-center"
                >
                    {loading ? 'Buscando...' : <><SearchIcon /> <span className="ml-1">Buscar</span></>}
                </button>
            </div>
            
            <div className="mt-4">
                <button 
                    onClick={handleDemoVehicle}
                    className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                    Añadir Vehículo Demo
                </button>
            </div>
            
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            
            <div className="mt-4 max-h-48 overflow-y-auto">
                {searchResults.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {searchResults.map((vehicle, index) => (
                            <li 
                                key={index} 
                                onClick={() => onSelectVehicle(vehicle)}
                                className="p-3 hover:bg-gray-100 cursor-pointer transition-colors"
                            >
                                <p className="font-semibold text-gray-800">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
                                <p className="text-sm text-gray-600">{vehicle.description}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    !loading && searchTerm.trim() !== '' && (
                        <p className="text-center text-gray-500">No se encontraron resultados para esa matrícula.</p>
                    )
                )}
            </div>
        </div>
    );
};

// --- Component to add a vehicle ---
const AddVehicleForm = ({ onVehicleAdded, userId, initialData }) => {
    const maintenanceTypes = [
        "Cambio de aceite y filtros",
        "Presión y estado de neumáticos",
        "Niveles de líquidos (frenos, refrigerante, etc.)",
        "Inspección de frenos",
        "Inspección de batería",
        "Bujías",
        "Correas"
    ];
    
    const [make, setMake] = useState(initialData?.make || '');
    const [model, setModel] = useState(initialData?.model || '');
    const [year, setYear] = useState(initialData?.year || '');
    const [km, setKm] = useState('');
    
    const [techSheetFile, setTechSheetFile] = useState(null);
    const [insuranceFile, setInsuranceFile] = useState(null);
    const [itvFile, setItvFile] = useState(null);

    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [initialMaintenances, setInitialMaintenances] = useState(() => 
        Object.fromEntries(maintenanceTypes.map(type => [type, false]))
    );

    useEffect(() => {
      if (initialData) {
        setMake(initialData.make || '');
        setModel(initialData.model || '');
        setYear(initialData.year || '');
        setKm('');
      }
    }, [initialData]);

    const handleMaintenanceChange = (type) => {
        setInitialMaintenances(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!make || !model || !year || !km) {
            setUploadError("Por favor, rellena todos los campos del vehículo.");
            return;
        }

        setIsUploading(true);
        setUploadError(null);

        try {
            const formData = new FormData();
            formData.append('user_id', userId);
            formData.append('make', make);
            formData.append('model', model);
            formData.append('year', Number(year));
            formData.append('km', Number(km));

            if (techSheetFile) formData.append('tech_sheet_url', techSheetFile);
            if (insuranceFile) formData.append('insurance_url', insuranceFile);
            if (itvFile) formData.append('itv_url', itvFile);

            const newVehicle = await pb.collection('vehicles').create(formData);
            
            const newVehicleId = newVehicle.id;
            
            for (const type of maintenanceTypes) {
                if (initialMaintenances[type]) {
                    await pb.collection('maintenances').create({
                        vehicle_id: newVehicleId,
                        type: type,
                        date: new Date().toISOString().split('T')[0],
                        km: Number(km),
                        status: 'realizado',
                        notes: 'Mantenimiento inicial al añadir el vehículo.'
                    });
                }
            }
            onVehicleAdded();
        } catch (error) {
            console.error("Error añadiendo vehículo o subiendo archivos: ", error);
            setUploadError("Hubo un error al guardar el vehículo o los documentos.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Añadir Nuevo Vehículo</h2>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={make} onChange={e => setMake(e.target.value)} placeholder="Marca" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" readOnly={!!initialData} />
                    <input value={model} onChange={e => setModel(e.target.value)} placeholder="Modelo" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" readOnly={!!initialData} />
                    <input type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="Año" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" readOnly={!!initialData} />
                    <input type="number" value={km} onChange={e => setKm(e.target.value)} placeholder="Kilómetros" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" required />
                </div>
                
                {!!initialData && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-bold mb-3">¿Se han realizado estos mantenimientos?</h3>
                        <p className="text-sm text-gray-600 mb-4">Selecciona los mantenimientos que se han hecho en el kilometraje actual.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {maintenanceTypes.map(type => (
                                <div key={type} className="flex items-center">
                                    <input
                                        id={`initial-maint-${type}`}
                                        type="checkbox"
                                        checked={initialMaintenances[type]}
                                        onChange={() => handleMaintenanceChange(type)}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    />
                                    <label htmlFor={`initial-maint-${type}`} className="ml-2 block text-sm text-gray-900">
                                        {type}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="mt-6">
                    <FileUploader onFileChange={setTechSheetFile} label="Ficha Técnica" />
                    <FileUploader onFileChange={setInsuranceFile} label="Póliza del Seguro" />
                    <FileUploader onFileChange={setItvFile} label="Ficha de Inspección Técnica" />
                </div>
                
                {uploadError && <p className="text-red-500 text-sm mt-4 text-center">{uploadError}</p>}
                
                <button type="submit" disabled={isUploading} className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4 flex items-center justify-center disabled:bg-gray-400">
                    {isUploading ? 'Guardando...' : <><PlusIcon /> <span className="ml-2">Añadir Vehículo</span></>}
                </button>
            </form>
        </div>
    );
};

// --- File Upload Component ---
const FileUploader = ({ onFileChange, label }) => {
    return (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">{label}</label>
            <input type="file" onChange={e => onFileChange(e.target.files[0])} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
    );
};

// --- Component to display a vehicle and its details ---
const VehicleCard = ({ vehicle }) => {
    const [showMaintenance, setShowMaintenance] = useState(false);
    const [maintenances, setMaintenances] = useState([]);
    const [newMaintenance, setNewMaintenance] = useState({ type: '', date: '', km: '', status: 'pendiente', notes: '' });
    const [currentKm, setCurrentKm] = useState(vehicle.km || 0);
    const [newTechSheetFile, setNewTechSheetFile] = useState(null);
    const [newInsuranceFile, setNewInsuranceFile] = useState(null);
    const [newItvFile, setNewItvFile] = useState(null);
    const [documentError, setDocumentError] = useState('');
    const [maintenanceMessage, setMaintenanceMessage] = useState('');

    const maintenanceTypes = [
        "Cambio de aceite y filtros",
        "Presión y estado de neumáticos",
        "Niveles de líquidos (frenos, refrigerante, etc.)",
        "Inspección de frenos",
        "Inspección de batería",
        "Bujías",
        "Correas"
    ];

    // Función para ordenar mantenimientos por 'created' descendente (más reciente primero)
    const sortMaintenances = (list) => list.sort((a, b) => new Date(b.created) - new Date(a.created));

    useEffect(() => {
        const fetchInitialMaintenances = async () => {
            try {
                const records = await pb.collection('maintenances').getFullList({
                    filter: `vehicle_id = "${vehicle.id}"`,
                    sort: '-created'
                });
                console.log('Initial maintenances fetched:', records);
                setMaintenances(records); // Ya ordenados por PocketBase
            } catch (error) {
                console.error("Error fetching initial maintenances:", error);
                setMaintenanceMessage("Error al cargar los mantenimientos iniciales.");
            }
        };

        fetchInitialMaintenances();

        const unsubscribe = pb.collection('maintenances').subscribe('*', (e) => {
            console.log('Real-time maintenance event:', {
                action: e.action,
                record: e.record,
                vehicle_id: e.record.vehicle_id,
                matches_vehicle: e.record.vehicle_id === vehicle.id
            });
            if (e.record.vehicle_id === vehicle.id) {
                setMaintenances(prev => {
                    let newMaintenances = [...prev];
                    if (e.action === 'create') {
                        if (!newMaintenances.some(m => m.id === e.record.id)) {
                            newMaintenances = [...newMaintenances, e.record];
                            newMaintenances = sortMaintenances(newMaintenances);
                            console.log('Updated maintenances (create via subscription):', newMaintenances);
                        }
                    } else if (e.action === 'update') {
                        newMaintenances = newMaintenances.map(m => m.id === e.record.id ? e.record : m);
                        console.log('Updated maintenances (update via subscription):', newMaintenances);
                    } else if (e.action === 'delete') {
                        newMaintenances = newMaintenances.filter(m => m.id !== e.record.id);
                        console.log('Updated maintenances (delete via subscription):', newMaintenances);
                    }
                    return newMaintenances;
                });
            }
        }, (error) => {
            console.error("Subscription error:", error);
            setMaintenanceMessage("Error en la suscripción en tiempo real. Intenta recargar la página.");
        });

        return () => {
            pb.collection('maintenances').unsubscribe('*').catch(err => {
                console.error("Error unsubscribing:", err);
            });
        };
    }, [vehicle.id]);

    const handleAddMaintenance = async (e) => {
        e.preventDefault();
        if (!newMaintenance.type || !newMaintenance.date || !newMaintenance.km) {
            setMaintenanceMessage("Por favor, completa todos los campos obligatorios (tipo, fecha, km).");
            console.log('Validation failed:', newMaintenance);
            return;
        }

        try {
            const newRecord = {
                vehicle_id: vehicle.id,
                type: newMaintenance.type,
                date: newMaintenance.date,
                km: Number(newMaintenance.km),
                status: newMaintenance.status,
                notes: newMaintenance.notes
            };
            console.log('Creating maintenance with data:', newRecord);

            const createdRecord = await pb.collection('maintenances').create(newRecord);
            console.log('Maintenance created:', createdRecord);

            setMaintenances(prev => {
                let newMaintenances = [...prev];
                if (!newMaintenances.some(m => m.id === createdRecord.id)) {
                    newMaintenances = [...newMaintenances, createdRecord];
                    newMaintenances = sortMaintenances(newMaintenances);
                    console.log('Updated maintenances (create local):', newMaintenances);
                }
                return newMaintenances;
            });

            setMaintenanceMessage("Mantenimiento añadido correctamente.");
            setTimeout(() => setMaintenanceMessage(''), 3000);
            setNewMaintenance({ type: '', date: '', km: '', status: 'pendiente', notes: '' });
        } catch (error) {
            console.error("Error adding maintenance:", error, error.data);
            setMaintenanceMessage(`Error al añadir el mantenimiento: ${error.message || 'Inténtalo de nuevo.'}`);
        }
    };

    const handleUpdateStatus = async (maintenanceId, newStatus) => {
        try {
            await pb.collection('maintenances').update(maintenanceId, { status: newStatus });
            console.log(`Maintenance ${maintenanceId} status updated to ${newStatus}`);
        } catch (error) {
            console.error("Error updating status:", error);
            setMaintenanceMessage("Error al actualizar el estado. Inténtalo de nuevo.");
        }
    };
    
    const handleDeleteMaintenance = async (maintenanceId) => {
        const isConfirmed = window.confirm("¿Está seguro que desea eliminar este mantenimiento?");
        if (isConfirmed) {
            try {
                await pb.collection('maintenances').delete(maintenanceId);
                setMaintenanceMessage("Mantenimiento eliminado correctamente.");
                setTimeout(() => setMaintenanceMessage(''), 3000);
            } catch (error) {
                console.error("Error deleting maintenance:", error);
                setMaintenanceMessage("Error al eliminar el mantenimiento. Inténtalo de nuevo.");
            }
        }
    };
    
    const handleUpdateKm = async () => {
        try {
            await pb.collection('vehicles').update(vehicle.id, { km: Number(currentKm) });
            console.log(`Vehicle ${vehicle.id} km updated to ${currentKm}`);
        } catch (error) {
            console.error("Error updating km:", error);
            setMaintenanceMessage("Error al actualizar los kilómetros. Inténtalo de nuevo.");
        }
    };
    
    const handleDelete = async () => {
        const isConfirmed = window.confirm(`¿Está seguro que desea eliminar el vehículo con ID ${vehicle.id} (${vehicle.make} ${vehicle.model})?`);
        if (isConfirmed) {
            try {
                await pb.collection('vehicles').delete(vehicle.id);
                setMaintenanceMessage("Vehículo eliminado correctamente.");
                setTimeout(() => setMaintenanceMessage(''), 3000);
            } catch (error) {
                console.error("Error deleting vehicle:", error);
                setMaintenanceMessage("Error al eliminar el vehículo. Inténtalo de nuevo.");
            }
        }
    };
    
    const handleDeleteDocument = async (field) => {
        const isConfirmed = window.confirm(`¿Está seguro que desea eliminar el documento ${field === 'tech_sheet_url' ? 'Ficha Técnica' : field === 'insurance_url' ? 'Póliza del Seguro' : 'Ficha de Inspección Técnica'}?`);
        if (isConfirmed) {
            try {
                const dataToUpdate = { [field]: null };
                await pb.collection('vehicles').update(vehicle.id, dataToUpdate);
                setDocumentError('');
                setMaintenanceMessage("Documento eliminado correctamente.");
                setTimeout(() => setMaintenanceMessage(''), 3000);
            } catch (error) {
                console.error(`Error deleting document ${field}:`, error);
                setDocumentError(`Error al eliminar el documento ${field === 'tech_sheet_url' ? 'Ficha Técnica' : field === 'insurance_url' ? 'Póliza del Seguro' : 'Ficha de Inspección Técnica'}.`);
            }
        }
    };

    const handleReplaceDocument = async (field, file) => {
        if (!file) {
            setDocumentError('Por favor, selecciona un archivo para reemplazar.');
            return;
        }
        try {
            const formData = new FormData();
            formData.append(field, file);
            await pb.collection('vehicles').update(vehicle.id, formData);
            setDocumentError('');
            setMaintenanceMessage("Documento reemplazado correctamente.");
            setTimeout(() => setMaintenanceMessage(''), 3000);
            if (field === 'tech_sheet_url') setNewTechSheetFile(null);
            if (field === 'insurance_url') setNewInsuranceFile(null);
            if (field === 'itv_url') setNewItvFile(null);
        } catch (error) {
            console.error(`Error replacing document ${field}:`, error);
            setDocumentError(`Error al reemplazar el documento ${field === 'tech_sheet_url' ? 'Ficha Técnica' : field === 'insurance_url' ? 'Póliza del Seguro' : 'Ficha de Inspección Técnica'}.`);
        }
    };

    const getNextMaintenanceInfo = (type) => {
        const lastDone = maintenances
            .filter(m => m.type === type && m.status === 'realizado')
            .sort((a, b) => b.km - a.km)[0];
        
        const lastKm = lastDone ? lastDone.km : 0;
        let interval;
        switch(type) {
            case "Cambio de aceite y filtros": interval = 15000; break;
            case "Inspección de frenos": interval = 30000; break;
            case "Correas": interval = 100000; break;
            default: interval = 20000; 
        }
        
        const nextKm = lastKm + interval;
        const kmRemaining = nextKm - currentKm;

        if (kmRemaining <= 0) {
            return <span className="text-red-500 font-bold">¡Realizar ya! (Hace {-kmRemaining} km)</span>;
        } else if (kmRemaining <= 2000) {
            return <span className="text-yellow-500 font-bold">Próximo en {kmRemaining} km</span>;
        } else {
            return <span className="text-green-500">Próximo en {kmRemaining} km</span>;
        }
    };
    
    const getFileUrl = (fileName) => {
        return pb.files.getURL(vehicle, fileName); // Cambiado a getURL para eliminar la advertencia de deprecación
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 transition-shadow duration-300 hover:shadow-xl">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">{vehicle.make} {vehicle.model} ({vehicle.year})</h3>
                    <div className="flex items-center mt-2">
                        <input 
                            type="number" 
                            value={currentKm}
                            onChange={(e) => setCurrentKm(e.target.value)}
                            onBlur={handleUpdateKm}
                            className="text-gray-600 border-b-2 border-gray-300 focus:border-blue-500 outline-none"
                        />
                        <span className="ml-1">km</span>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => setShowMaintenance(!showMaintenance)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
                        {showMaintenance ? 'Ocultar' : 'Gestionar'}
                    </button>
                    <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700">
                        Eliminar
                    </button>
                </div>
            </div>

            {showMaintenance && (
                <div className="mt-6 border-t pt-6">
                    <h4 className="text-lg font-semibold mb-2">Documentos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {['tech_sheet_url', 'insurance_url', 'itv_url'].map(field => (
                            <div key={field} className="flex flex-col">
                                {vehicle[field] ? (
                                    <>
                                        <a 
                                            href={getFileUrl(vehicle[field])} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-blue-500 hover:underline mb-2"
                                        >
                                            <DocumentIcon /> 
                                            {field === 'tech_sheet_url' ? 'Ficha Técnica' : field === 'insurance_url' ? 'Póliza Seguro' : 'Ficha ITV'}
                                        </a>
                                        <div className="flex space-x-2">
                                            <button 
                                                onClick={() => handleDeleteDocument(field)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm flex items-center"
                                            >
                                                <TrashIcon /> <span className="ml-1">Eliminar</span>
                                            </button>
                                            <div>
                                                <input 
                                                    type="file" 
                                                    onChange={e => {
                                                        if (field === 'tech_sheet_url') setNewTechSheetFile(e.target.files[0]);
                                                        if (field === 'insurance_url') setNewInsuranceFile(e.target.files[0]);
                                                        if (field === 'itv_url') setNewItvFile(e.target.files[0]);
                                                    }}
                                                    className="text-sm"
                                                />
                                                <button 
                                                    onClick={() => handleReplaceDocument(field, 
                                                        field === 'tech_sheet_url' ? newTechSheetFile : 
                                                        field === 'insurance_url' ? newInsuranceFile : newItvFile)}
                                                    className="bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm flex items-center mt-1"
                                                    disabled={
                                                        field === 'tech_sheet_url' ? !newTechSheetFile : 
                                                        field === 'insurance_url' ? !newInsuranceFile : !newItvFile
                                                    }
                                                >
                                                    <UploadIcon /> <span className="ml-1">Reemplazar</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <span className="text-gray-500">
                                            {field === 'tech_sheet_url' ? 'Ficha Técnica' : field === 'insurance_url' ? 'Póliza Seguro' : 'Ficha ITV'}: No disponible
                                        </span>
                                        <div>
                                            <input 
                                                type="file" 
                                                onChange={e => {
                                                    if (field === 'tech_sheet_url') setNewTechSheetFile(e.target.files[0]);
                                                    if (field === 'insurance_url') setNewInsuranceFile(e.target.files[0]);
                                                    if (field === 'itv_url') setNewItvFile(e.target.files[0]);
                                                }}
                                                className="text-sm"
                                            />
                                            <button 
                                                onClick={() => handleReplaceDocument(field, 
                                                    field === 'tech_sheet_url' ? newTechSheetFile : 
                                                    field === 'insurance_url' ? newInsuranceFile : newItvFile)}
                                                className="bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm flex items-center mt-1"
                                                disabled={
                                                    field === 'tech_sheet_url' ? !newTechSheetFile : 
                                                    field === 'insurance_url' ? !newInsuranceFile : !newItvFile
                                                }
                                            >
                                                <UploadIcon /> <span className="ml-1">Subir</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {documentError && <p className="text-red-500 text-sm mb-4">{documentError}</p>}
                    {maintenanceMessage && (
                        <p className={`text-sm mb-4 ${maintenanceMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                            {maintenanceMessage}
                        </p>
                    )}

                    <h4 className="text-lg font-semibold mb-2"><WrenchIcon /> Mantenimientos</h4>
                    
                    <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-bold mb-2">Alertas Próximos Mantenimientos</h5>
                        <ul className="list-disc list-inside space-y-1">
                           {maintenanceTypes.map(type => (
                               <li key={type}>{type}: {getNextMaintenanceInfo(type)}</li>
                           ))}
                        </ul>
                    </div>
                    
                    <form onSubmit={handleAddMaintenance} className="mb-4 bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-bold mb-2">Añadir Mantenimiento</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <select value={newMaintenance.type} onChange={e => setNewMaintenance({...newMaintenance, type: e.target.value})} className="shadow border rounded w-full py-2 px-3">
                                <option value="">Tipo de mantenimiento</option>
                                {maintenanceTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                            <input type="date" value={newMaintenance.date} onChange={e => setNewMaintenance({...newMaintenance, date: e.target.value})} className="shadow border rounded w-full py-2 px-3" />
                            <input type="number" placeholder="KM en la revisión" value={newMaintenance.km} onChange={e => setNewMaintenance({...newMaintenance, km: e.target.value})} className="shadow border rounded w-full py-2 px-3" />
                            <select value={newMaintenance.status} onChange={e => setNewMaintenance({...newMaintenance, status: e.target.value})} className="shadow border rounded w-full py-2 px-3">
                                <option value="pendiente">Pendiente</option>
                                <option value="realizado">Realizado</option>
                            </select>
                            <input placeholder="Notas" value={newMaintenance.notes} onChange={e => setNewMaintenance({...newMaintenance, notes: e.target.value})} className="md:col-span-2 shadow border rounded w-full py-2 px-3" />
                        </div>
                        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-3">Añadir</button>
                    </form>

                    <ul className="space-y-2">
                        {maintenances.map(m => (
                            <li key={m.id} className={`p-3 rounded flex justify-between items-center ${m.status === 'realizado' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                <div>
                                    <span className="font-semibold">{m.type}</span> - {m.date} a los {m.km} km. ({m.status})
                                    <p className="text-sm text-gray-600">{m.notes}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleUpdateStatus(m.id, m.status === 'realizado' ? 'pendiente' : 'realizado')}
                                        className={`p-1 rounded ${m.status === 'realizado' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white transition-colors`}
                                        title={m.status === 'realizado' ? 'Marcar como pendiente' : 'Marcar como realizado'}
                                    >
                                        {m.status === 'realizado' ? <ClockIcon /> : <CheckCircleIcon />}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteMaintenance(m.id)}
                                        className="p-1 rounded bg-red-500 hover:bg-red-600 text-white transition-colors"
                                        title="Eliminar mantenimiento"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


// --- Components for Workshops (NUEVO Y MEJORADO) ---
const WorkshopCard = ({ workshop, onSelect, isSelected }) => (
    <div 
        className={`p-4 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:shadow-md'}`}
        onClick={() => onSelect(workshop)}
    >
        <h4 className="font-bold text-lg">{workshop.name}</h4>
        <p className="text-sm text-gray-600">{workshop.address}</p>
        {workshop.phone && <p className="text-sm text-gray-600 mt-1">Tel: {workshop.phone}</p>}
        {workshop.specialties && workshop.specialties.length > 0 && (
            <div className="text-sm mt-2">
                <span className="font-semibold">Especialidades:</span> {workshop.specialties.join(', ')}
            </div>
        )}
    </div>
);

const BookingCalendar = ({ workshop, userId, userVehicles, onBookingSuccess }) => {
    const today = new Date().toISOString().split('T')[0];
    const [selectedVehicle, setSelectedVehicle] = useState(userVehicles[0]?.id || '');
    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedTime, setSelectedTime] = useState('');
    const [reason, setReason] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const availableTimes = ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00"];

    const handleBooking = async () => {
        if (!selectedVehicle || !selectedDate || !selectedTime) {
            setError('Por favor, selecciona un vehículo, fecha y hora.');
            return;
        }
        setError('');
        setMessage('');

        try {
            const data = {
                user: userId,
                vehicle: selectedVehicle,
                workshop: workshop.id,
                date: selectedDate,
                time: selectedTime,
                reason: reason,
                status: 'solicitada',
            };
            await pb.collection('appointments').create(data);
            setMessage(`¡Cita solicitada en ${workshop.name} el ${selectedDate} a las ${selectedTime}!`);
            setSelectedTime('');
            setReason('');
            if (onBookingSuccess) onBookingSuccess(); // Llama al callback para refrescar la lista de citas
        } catch (err) {
            console.error("Error al reservar la cita:", err);
            setError('Hubo un error al solicitar la cita. Inténtalo de nuevo.');
        }
    };

    if (userVehicles.length === 0) {
        return (
            <div className="mt-4 p-4 bg-yellow-100 text-yellow-800 rounded-lg shadow-inner">
                <p className="font-semibold text-center">Necesitas añadir al menos un vehículo para poder reservar una cita.</p>
            </div>
        );
    }

    return (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-inner">
            <h4 className="font-bold mb-4">Reserva tu cita en {workshop.name}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehículo</label>
                    <select
                        value={selectedVehicle}
                        onChange={e => setSelectedVehicle(e.target.value)}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                        {userVehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de la cita</label>
                    <input
                        type="text"
                        placeholder="Ej: Revisión, cambio de aceite..."
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <input 
                        type="date"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        min={today}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                    <select 
                        value={selectedTime}
                        onChange={e => setSelectedTime(e.target.value)}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                        <option value="">Selecciona una hora</option>
                        {availableTimes.map(time => <option key={time} value={time}>{time}</option>)}
                    </select>
                </div>
            </div>
            <button 
                onClick={handleBooking}
                disabled={!selectedTime || !selectedVehicle}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
            >
                Confirmar Cita
            </button>
            {message && <p className="text-center mt-3 text-sm font-semibold text-green-600">{message}</p>}
            {error && <p className="text-center mt-3 text-sm font-semibold text-red-600">{error}</p>}
        </div>
    );
};

const AppointmentsList = ({ appointments, onCancel }) => {
    if (appointments.length === 0) {
        return <p className="text-sm text-gray-500 mt-4">No tienes citas pendientes.</p>;
    }
    
    const statusColor = {
        solicitada: 'bg-yellow-100 text-yellow-800',
        confirmada: 'bg-green-100 text-green-800',
        cancelada: 'bg-red-100 text-red-800',
        completada: 'bg-blue-100 text-blue-800'
    };

    return (
        <div className="mt-6">
            <h4 className="text-lg font-semibold mb-2">Mis Citas</h4>
            <ul className="space-y-3">
                {appointments.map(app => (
                    <li key={app.id} className="p-3 bg-gray-50 rounded-lg shadow-sm flex justify-between items-center">
                        <div>
                            <p className="font-bold">{app.expand.workshop.name}</p>
                            <p className="text-sm">{new Date(app.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {app.time}</p>
                            <p className="text-sm text-gray-600">Vehículo: {app.expand.vehicle.make} {app.expand.vehicle.model}</p>
                            <p className="text-sm text-gray-600">Motivo: {app.reason || 'No especificado'}</p>
                        </div>
                        <div className="text-right">
                           <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusColor[app.status]}`}>{app.status}</span>
                           {(app.status === 'solicitada' || app.status === 'confirmada') && (
                               <button 
                                   onClick={() => onCancel(app.id)}
                                   className="mt-2 text-xs bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                                >
                                    Cancelar
                                </button>
                           )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const WorkshopSection = ({ userId, userVehicles }) => {
    const [workshops, setWorkshops] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [selectedWorkshop, setSelectedWorkshop] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchWorkshopsAndAppointments = async () => {
        try {
            setLoading(true);
            const workshopRecords = await pb.collection('workshops').getFullList({ sort: 'name' });
            setWorkshops(workshopRecords);

            const appointmentRecords = await pb.collection('appointments').getFullList({
                filter: `user = "${userId}"`,
                sort: '-date',
                expand: 'workshop,vehicle' // Expande las relaciones para obtener sus datos
            });
            setAppointments(appointmentRecords);
        } catch (error) {
            console.error("Error al cargar talleres o citas:", error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchWorkshopsAndAppointments();
    }, [userId]);

    const handleCancelAppointment = async (appointmentId) => {
        if (window.confirm("¿Seguro que quieres cancelar esta cita?")) {
            try {
                // Opción 1: Eliminar la cita
                // await pb.collection('appointments').delete(appointmentId);
                
                // Opción 2: Cambiar el estado a "cancelada"
                await pb.collection('appointments').update(appointmentId, { status: 'cancelada' });
                
                // Refrescar la lista de citas
                fetchWorkshopsAndAppointments();
            } catch(error) {
                console.error("Error al cancelar la cita:", error);
                alert("No se pudo cancelar la cita. Inténtalo de nuevo.");
            }
        }
    };

    if (loading) return <p>Cargando talleres...</p>;

    return (
        <div className="mt-12 p-6 bg-gray-100 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center"><CalendarIcon /> Citas con Talleres</h2>
            
            <AppointmentsList appointments={appointments} onCancel={handleCancelAppointment} />

            <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Buscar un Taller</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workshops.map(ws => (
                    <WorkshopCard 
                        key={ws.id} 
                        workshop={ws} 
                        onSelect={setSelectedWorkshop}
                        isSelected={selectedWorkshop?.id === ws.id}
                    />
                ))}
            </div>
            {selectedWorkshop && (
                <BookingCalendar 
                    workshop={selectedWorkshop} 
                    userId={userId} 
                    userVehicles={userVehicles}
                    onBookingSuccess={fetchWorkshopsAndAppointments} // Callback para refrescar
                />
            )}
        </div>
    );
};


// --- Main Dashboard Component ---
const Dashboard = ({ user, onLogout }) => {
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicleForAdd, setSelectedVehicleForAdd] = useState(null);

    useEffect(() => {
        if (user) {
            const fetchVehicles = async () => {
                try {
                    const records = await pb.collection('vehicles').getFullList({
                        filter: `user_id = "${user.id}"`,
                        sort: '-created'
                    });
                    setVehicles(records);
                } catch (error) {
                    console.error("Error al obtener vehículos:", error);
                }
            };
            fetchVehicles();

            const unsubscribe = pb.collection('vehicles').subscribe('*', (e) => {
                if (e.record.user_id === user.id) {
                     fetchVehicles(); // Recargamos la lista para mantener la consistencia
                }
            });

            return () => {
                pb.collection('vehicles').unsubscribe('*');
            };
        }
    }, [user]);

    const handleVehicleAdded = () => {
        setSelectedVehicleForAdd(null);
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800"><CarIcon />OPTIAUTO</h1>
                    <p className="text-sm text-gray-500">Sesión iniciada como: {user.email}</p>
                </div>
                <button onClick={onLogout} className="flex items-center text-gray-600 hover:text-red-500 transition-colors">
                    <span className="mr-2 hidden md:inline">Cerrar Sesión</span>
                    <LogoutIcon />
                </button>
            </header>
            
            {!selectedVehicleForAdd && (
                <div className="mb-8">
                    <VehicleSearch onSelectVehicle={setSelectedVehicleForAdd} />
                </div>
            )}

            {selectedVehicleForAdd && (
                <AddVehicleForm
                    onVehicleAdded={handleVehicleAdded}
                    userId={user.id}
                    initialData={selectedVehicleForAdd}
                />
            )}

            <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Mis Vehículos</h2>
                {vehicles.length > 0 ? (
                    vehicles.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} />)
                ) : (
                    <p className="text-center text-gray-500 mt-8">No tienes vehículos añadidos. ¡Usa el buscador para añadir el primero!</p>
                )}
            </div>
            
            <WorkshopSection userId={user.id} userVehicles={vehicles} />
        </div>
    );
};

// --- Authentication Component ---
const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await pb.collection('users').authWithPassword(email, password);
            } else {
                await pb.collection('users').create({
                    email,
                    password,
                    passwordConfirm: password
                });
                await pb.collection('users').authWithPassword(email, password);
            }
        } catch (err) {
            console.error("Authentication error:", err);
            if (err.message.includes('ERR_BLOCKED_BY_CLIENT')) {
                setError('La solicitud fue bloqueada por una extensión del navegador (como un bloqueador de anuncios). Desactiva las extensiones como uBlock Origin o añade una excepción para http://127.0.0.1:8090.');
            } else if (err.message.includes('Failed to fetch')) {
                setError('No se pudo conectar con el servidor de PocketBase. Asegúrate de que el servidor esté ejecutándose en http://127.0.0.1:8090.');
            } else {
                setError(err.message || 'Error en la autenticación. Verifica tus credenciales e intenta de nuevo.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-center mb-6">{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Correo electrónico"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Contraseña"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3"
                        required
                    />
                    {error && <p className="text-red-500 text-xs italic mb-3">{error}</p>}
                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        {isLogin ? 'Entrar' : 'Crear Cuenta'}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600 mt-4">
                    {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                    <button onClick={() => setIsLogin(!isLogin)} className="text-blue-500 hover:underline ml-1">
                        {isLogin ? 'Regístrate' : 'Inicia Sesión'}
                    </button>
                </p>
            </div>
        </div>
    );
};

// --- Root App Component ---
export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = pb.authStore.onChange((token, model) => {
            setUser(model);
            setLoading(false);
        }, true);

        return () => {
            // No hay una función `unsubscribe` directa en el `onChange` del authStore.
            // Se limpia al desmontar el componente.
        };
    }, []);

    const handleLogout = () => {
    // 1. Primero, nos desuscribimos de TODAS las conexiones en tiempo real.
    // Esto evita que los componentes hijos intenten hacerlo después de que la sesión se cierre.
    pb.realtime.unsubscribe();

    // 2. Después, limpiamos la sesión del usuario.
    // Esto disparará el listener 'onChange' que pondrá el usuario a `null`.
    pb.authStore.clear();
};

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            {user ? <Dashboard user={user} onLogout={handleLogout} /> : <AuthPage />}
        </div>
    );
}
