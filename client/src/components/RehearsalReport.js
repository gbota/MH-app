<TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
        <TableHead>First Name</TableHead>
        <TableHead>Last Name</TableHead>
        <TableHead>Grade</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHead>
    <TableBody>
      {students.map((student) => (
        <TableRow key={student.id}>
          <TableCell>{student.first_name}</TableCell>
          <TableCell>{student.last_name}</TableCell>
          <TableCell>{student.grade}</TableCell>
          <TableCell>
            <FormControl fullWidth>
              <Select
                value={student.status || 'present'}
                onChange={(e) => handleStatusChange(student.id, e.target.value)}
              >
                <MenuItem value="present">Present</MenuItem>
                <MenuItem value="absent">Absent</MenuItem>
                <MenuItem value="late">Late</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer> 