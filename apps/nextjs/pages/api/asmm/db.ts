import sql from 'mssql';

const PASSWORD = 'SpeedyKoala1234!@#$';

export function connect(sqlLib: typeof sql) {
	return sqlLib.connect(`Server=tcp:ausspeedruns.database.windows.net,1433;Initial Catalog=ASMM_DATA;Persist Security Info=False;User ID=asmmsqlaccess;Password=${PASSWORD};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;`)
}
