import { useState, useEffect } from 'react';
import { getApiBaseUrl } from '../utils/apiConfig';

const API_BASE_URL = getApiBaseUrl();
const DOCTOR_DATA_API_URL = `${API_BASE_URL}/doctors/grouped`;
const LEAVE_DATA_API_URL = `${API_BASE_URL}/doctors/on-leave`;

export const useDoctorData = () => {
    const [doctorsData, setDoctorsData] = useState({});
    const [leaveData, setLeaveData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Try cache first
                const doctorsCacheKey = 'cache_doctors';
                const leaveCacheKey = 'cache_leave_data';
                const cacheTTL = 5 * 60 * 1000; // 5 minutes

                let doctorsFromCache = null;
                let leaveFromCache = null;

                // Check doctors cache
                const cachedDoctors = localStorage.getItem(doctorsCacheKey);
                if (cachedDoctors) {
                    try {
                        const { data, timestamp } = JSON.parse(cachedDoctors);
                        if (Date.now() - timestamp < cacheTTL) {
                            doctorsFromCache = data;
                        }
                    } catch (e) {
                        console.warn('Cache parse error for doctors');
                    }
                }

                // Check leave cache
                const cachedLeave = localStorage.getItem(leaveCacheKey);
                if (cachedLeave) {
                    try {
                        const { data, timestamp } = JSON.parse(cachedLeave);
                        if (Date.now() - timestamp < cacheTTL) {
                            leaveFromCache = data;
                        }
                    } catch (e) {
                        console.warn('Cache parse error for leave data');
                    }
                }

                // If both cached, use cache
                if (doctorsFromCache && leaveFromCache) {
                    console.log('✅ Using cached doctor & leave data');
                    setDoctorsData(doctorsFromCache);
                    setLeaveData(leaveFromCache);
                    setLoading(false);
                    return;
                }

                // Fetch from API (removed cache buster - rely on server headers)
                console.log('❌ Fetching doctor & leave data from API');
                const [leaveResponse, doctorResponse] = await Promise.all([
                    fetch(LEAVE_DATA_API_URL),
                    fetch(DOCTOR_DATA_API_URL)
                ]);

                if (!leaveResponse.ok || !doctorResponse.ok) {
                    throw new Error("Gagal mengambil data dari server.");
                }

                const leaveJson = await leaveResponse.json();
                const doctorJson = await doctorResponse.json();

                // Store in cache
                localStorage.setItem(doctorsCacheKey, JSON.stringify({
                    data: doctorJson,
                    timestamp: Date.now()
                }));
                localStorage.setItem(leaveCacheKey, JSON.stringify({
                    data: leaveJson,
                    timestamp: Date.now()
                }));

                setLeaveData(leaveJson);
                setDoctorsData(doctorJson);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { doctorsData, leaveData, loading, error };
};
