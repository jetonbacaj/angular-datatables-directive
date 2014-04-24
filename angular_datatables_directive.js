'use strict';

angular.module("datatableTest").directive('dataTable', ['$compile',
    function ($compile) {
        return function (scope, element, attrs) {

            // apply DataTable options, use defaults if none specified by user
            var options = {};

            if (attrs.dataTable.length > 0) {
                options = scope.$eval(attrs.dataTable);
            } else {
                options = {
                    "bStateSave": true,
                    //"iCookieDuration": 2419200, /* 1 month */
                    "bPaginate": true,
                    "bLengthChange": true,
                    "bFilter": true,
                    "bInfo": true,
                    "bAutoWidth": true,
                    "bDeferRender": true,
                    "aaSorting": [],
                    "aLengthMenu": [
                        [10, 25, 50, 100, 200, -1],
                        [10, 25, 50, 100, 200, "All"]
                    ],
                    //"sDom": '<T"clear">frtip',

                    "oTableTools": {
                        "sRowSelect": "multi",
                        "aButtons": []/*["select_all", "select_none"]*/
                    },

                    "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {

                        angular.element('td', nRow)
                            .bind('dblclick', function (event) {
                                event.preventDefault();
								// do something with the "aData" - that is the element/object that was doubleclicked

                            });

                        return nRow;
                    },

					// let us say that you want to use another library (jquery ui, for instance) to 
					// do something thatmangular cannot - but we still want angular to manage 
					// interaction between the application and data
					//
					// You would do something like the following
					//
                    "fnCreatedRow": function (nRow, aData, iDataIndex) {
                        var row = "<div> " + angular.element(nRow).find('td').html() + " </div>";

                        row = angular.element(row)
                            .attr("data-drag", "true")
                            .attr("jqyoui-options", "{revert: 'invalid'}")
                            .attr("jqyoui-draggable", "{animate: true, opacity: 0.5, index: " + iDataIndex + "}");

                        angular.element(nRow).find('td').html(row);
                        $compile(angular.element(nRow))(scope); //"register" it with angular
                    },

					// define/display only the columns you want
                    "aoColumnDefs": [
                        { "mDataProp": "FIELD1", "aTargets": [0]}/*,
                         { "mDataProp": "Field1", "aTargets":[1] },
                         { "mDataProp": "id", "aTargets":[2] }*/
                    ],

                    "bDestroy": true
                };
            }

            // Tell the dataTables plugin what columns to use
            // We can either derive them from the DOM, or use setup from the controller
            var explicitColumns = [];
            angular.forEach(element.find('th'), function (elem) {
                explicitColumns.push(angular.element(elem).text());
            });

            if (explicitColumns.length > 0) {
                options["aoColumns"] = explicitColumns;
            } else if (attrs.aoColumns) {
                options["aoColumns"] = scope.$eval(attrs.aoColumns);
            }

            // aoColumnDefs is dataTables way of providing fine control over column config
            if (attrs.aoColumnDefs) {
                options["aoColumnDefs"] = scope.$eval(attrs.aoColumnDefs);
            }

            if (attrs.fnRowCallback) {
                options["fnRowCallback"] = scope.$eval(attrs.fnRowCallback);
            }

            if (attrs.fnCreatedRow) {
                options["fnCreatedRow"] = scope.$eval(attrs.fnCreatedRow);
            }

            // apply the plugin
            var dataTable = angular.element(element).DataTable(options);
            /**
             *
             *
             *********************************************************************************
             *********************************************************************************
             *
             *
             *
             *
             * TODO update the table in a smart way ... do not always rebuild the whole thing!
             *
             * watch for any changes to our data, rebuild the DataTable
             *
             *
             *
             *********************************************************************************
             *********************************************************************************
             *
             */
            scope.$watch(attrs.aaData, function (newValue, oldValue, scope) {
                if (newValue) {
                    dataTable.rows.clear();
                    dataTable.rows.add(scope.$eval(attrs.aaData));
                }
            }, true);
        };
    }]);
